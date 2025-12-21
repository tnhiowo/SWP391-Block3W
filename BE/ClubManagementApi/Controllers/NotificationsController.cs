using ClubManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClubManagementApi.Controllers
{
    [Authorize]
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly StudentClubContext _context;

        public NotificationsController(StudentClubContext context)
        {
            _context = context;
        }

        private int CurrentUserId => GetUserIdFromHttpContext(HttpContext);
        public static int GetUserIdFromHttpContext(HttpContext? context, ILogger? logger = null)
        {
            if (context == null)
            {
                logger?.LogError("HttpContext is null in JwtHelper.GetUserIdFromHttpContext.");
                throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");
            }

            if (context.User != null && context.User.Identity != null && context.User.Identity.IsAuthenticated)
            {
                var userIdClaim = context.User.FindFirst("UserId")?.Value
                               ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
                {
                    logger?.LogInformation("Successfully retrieved UserId {UserId} from claims.", userId);
                    return userId;
                }
                logger?.LogError("Invalid UserId claim: {UserIdClaim}", userIdClaim);
                throw new UnauthorizedAccessException("ID người dùng không hợp lệ.");
            }

            var token = context.Request.Query["access_token"].ToString();
            if (string.IsNullOrWhiteSpace(token))
            {
                logger?.LogError("No access_token found in query parameters.");
                throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "UserId" || c.Type == ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    logger?.LogError("UserId or nameidentifier claim not found in token.");
                    throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");
                }

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    logger?.LogError("Invalid UserId format in token: {UserIdClaim}", userIdClaim);
                    throw new UnauthorizedAccessException($"ID người dùng không hợp lệ: {userIdClaim}");
                }

                logger?.LogInformation("Successfully retrieved UserId {UserId} from access_token.", userId);
                return userId;
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "Failed to parse JWT token from access_token.");
                throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");
            }
        }

        public class PaginationParams
        {
            [Range(1, int.MaxValue, ErrorMessage = "Số trang phải lớn hơn 0")]
            public int PageNumber { get; set; } = 1;

            [Range(1, 100, ErrorMessage = "Kích thước trang từ 1 đến 100")]
            public int PageSize { get; set; } = 10;

            public string? Search { get; set; }
        }

        public class NotificationDto
        {
            public int NotificationId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public bool IsRead { get; set; }
            public DateTime CreatedAt { get; set; }
        }


        private IActionResult ValidationErrorResponse()
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Message = x.Value?.Errors.First().ErrorMessage })
                .ToList();

            return BadRequest(ApiResponse<object>.FailResponse("Dữ liệu không hợp lệ", errors));
        }


        [HttpGet]
        public async Task<IActionResult> GetMyNotifications([FromQuery] PaginationParams p, [FromQuery] bool unreadOnly = false)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var query = _context.Notifications
                .Where(n => n.UserId == CurrentUserId);

            if (unreadOnly)
                query = query.Where(n => n.IsRead == false);

            if (!string.IsNullOrEmpty(p.Search))
                query = query.Where(n => n.Title.Contains(p.Search.Trim()) || n.Message.Contains(p.Search.Trim()));

            query = query.OrderByDescending(n => n.CreatedAt);

            var total = await query.CountAsync();

            var list = await query
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Message = n.Message,
                    IsRead = n.IsRead.Value,
                    CreatedAt = n.CreatedAt.Value.ConvertToVietnamTime()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<NotificationDto>>.SuccessResponse(
                list,
                "Lấy danh sách thông báo thành công",
                total
            ));
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _context.Notifications
                .CountAsync(n => n.UserId == CurrentUserId && n.IsRead == false);

            return Ok(ApiResponse<object>.SuccessResponse(new { UnreadCount = count }));
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var noti = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == CurrentUserId);

            if (noti == null)
                return NotFound(ApiResponse<object>.FailResponse("Thông báo không tồn tại"));

            if (noti.IsRead == true)
                return Ok(ApiResponse<string>.SuccessResponse(null, "Thông báo đã được đọc trước đó"));

            noti.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResponse(null, "Đánh dấu đã đọc thành công"));
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var updated = await _context.Notifications
                .Where(n => n.UserId == CurrentUserId && n.IsRead == false)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

            return Ok(ApiResponse<object>.SuccessResponse(
                new { UpdatedCount = updated },
                updated > 0 ? "Đã đánh dấu tất cả thông báo là đã đọc" : "Không có thông báo chưa đọc"
            ));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var noti = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == CurrentUserId);

            if (noti == null)
                return NotFound(ApiResponse<object>.FailResponse("Thông báo không tồn tại"));

            _context.Notifications.Remove(noti);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResponse(null, "Xóa thông báo thành công"));
        }

        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAll()
        {
            var deleted = await _context.Notifications
                .Where(n => n.UserId == CurrentUserId)
                .ExecuteDeleteAsync();

            return Ok(ApiResponse<object>.SuccessResponse(
                new { DeletedCount = deleted },
                deleted > 0 ? "Đã xóa tất cả thông báo" : "Không có thông báo để xóa"
            ));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] PaginationParams p)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var query = _context.Notifications
                .Include(n => n.User)
                .OrderByDescending(n => n.CreatedAt);

            var total = await query.CountAsync();

            var list = await query
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .Select(n => new
                {
                    n.NotificationId,
                    UserId = n.User!.UserId,
                    UserName = n.User!.FullName,
                    n.Title,
                    n.Message,
                    n.IsRead,
                    CreatedAt = n.CreatedAt.Value.ConvertToVietnamTime()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse(list, "Danh sách tất cả thông báo trong hệ thống", total));
        }
    }
}