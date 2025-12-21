using ClubManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClubManagementApi.Controllers
{
    [Authorize(Roles = "ClubLeader")]
    [Route("api/fee-schedules")]
    [ApiController]
    public class FeeScheduleController : ControllerBase
    {
        private readonly StudentClubContext _context;

        public FeeScheduleController(StudentClubContext context)
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
        public class CreateFeeScheduleDto
        {
            [Required(ErrorMessage = "ID CLB là bắt buộc")]
            [Range(1, int.MaxValue, ErrorMessage = "ID CLB không hợp lệ")]
            public int ClubId { get; set; }

            [Required(ErrorMessage = "Tên khoản phí là bắt buộc")]
            [StringLength(200, MinimumLength = 5, ErrorMessage = "Tên khoản phí phải từ 5 đến 200 ký tự")]
            public string FeeName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Số tiền là bắt buộc")]
            [Range(1000, 10000000, ErrorMessage = "Số tiền phải từ 1.000đ đến 10.000.000đ")]
            public decimal Amount { get; set; }

            [Required(ErrorMessage = "Hạn nộp là bắt buộc")]
            public DateTime DueDate { get; set; }

            [Required(ErrorMessage = "Tần suất là bắt buộc")]
            [RegularExpression("^(Yearly|Monthly|OneTime|Quarterly)$", ErrorMessage = "Tần suất chỉ có thể là Yearly, Monthly hoặc OneTime")]
            public string Frequency { get; set; } = string.Empty;
        }

        public class UpdateFeeScheduleDto
        {
            [Required(ErrorMessage = "Tên khoản phí là bắt buộc")]
            [StringLength(200, MinimumLength = 5)]
            public string FeeName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Số tiền là bắt buộc")]
            [Range(1000, 10000000)]
            public decimal Amount { get; set; }

            [Required(ErrorMessage = "Hạn nộp là bắt buộc")]
            public DateTime DueDate { get; set; }

            [Required(ErrorMessage = "Tần suất là bắt buộc")]
            [RegularExpression("^(Yearly|Monthly|OneTime|Quarterly)$")]
            public string Frequency { get; set; } = string.Empty;
        }

        public class PaginationParams
        {
            [Range(1, int.MaxValue, ErrorMessage = "Số trang phải lớn hơn 0")]
            public int PageNumber { get; set; } = 1;

            [Range(1, 100, ErrorMessage = "Kích thước trang từ 1 đến 100")]
            public int PageSize { get; set; } = 10;

            public string? Search { get; set; }
        }

        public class FeeScheduleDto
        {
            public int FeeScheduleId { get; set; }
            public int ClubId { get; set; }
            public string ClubName { get; set; } = string.Empty;
            public string FeeName { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public DateOnly DueDate { get; set; }
            public string Frequency { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public bool IsRequiredFee { get; set; }
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


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeeScheduleDto dto)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var club = await _context.Clubs
                .Include(c => c.FeeSchedules)
                .FirstOrDefaultAsync(c => c.ClubId == dto.ClubId && c.PresidentId == CurrentUserId);

            if (club == null)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không phải chủ tịch CLB này"));

            if (dto.Frequency == "OneTime")
            {
                return BadRequest(ApiResponse<object>.FailResponse(
                    "Không thể tạo mới 'Phí tham gia CLB'. Vui lòng chỉnh sửa phí tham gia trong phần thông tin CLB."
                ));
            }

            var schedule = new FeeSchedule
            {
                ClubId = dto.ClubId,
                FeeName = dto.FeeName.Trim(),
                Amount = dto.Amount,
                DueDate = DateOnly.FromDateTime(dto.DueDate),
                Frequency = dto.Frequency,
                Status = "Active",
                CreatedAt = TimeZoneHelper.NowInVietnam,
                IsRequiredFee = false
            };

            _context.FeeSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            FireAndForget(async () =>
            {
                var memberIds = await _context.ClubMembers
                    .Where(m => m.ClubId == dto.ClubId && m.Status == "Approved")
                    .Select(m => m.UserId)
                    .ToListAsync();

                if (memberIds.Any())
                {
                    await NotificationService.SendToManyAsync(
                        memberIds,
                        "Khoản phí mới từ CLB",
                        $"CLB {club.ClubName} vừa tạo: {dto.FeeName} - {dto.Amount:N0}đ (Hạn nộp: {dto.DueDate:dd/MM/yyyy})"
                    );
                }
            });

            return Ok(ApiResponse<object>.SuccessResponse(
                new { schedule.FeeScheduleId },
                "Tạo khoản phí thành công và đã thông báo đến thành viên!"
            ));
        }

        [HttpGet("my-clubs")]
        public async Task<IActionResult> GetMyFeeSchedules([FromQuery] PaginationParams p)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var query = _context.FeeSchedules
                .Include(f => f.Club)
                .Where(f => f.Club!.PresidentId == CurrentUserId && f.Status == "Active");

            if (!string.IsNullOrEmpty(p.Search))
                query = query.Where(f => f.FeeName.Contains(p.Search.Trim()));

            var total = await query.CountAsync();

            var fees = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .Select(f => new FeeScheduleDto
                {
                    FeeScheduleId = f.FeeScheduleId,
                    ClubId = f.ClubId,
                    ClubName = f.Club!.ClubName,
                    FeeName = f.FeeName,
                    Amount = f.Amount,
                    DueDate = f.DueDate,
                    Frequency = f.Frequency,
                    Status = f.Status,
                    IsRequiredFee = f.IsRequiredFee,
                    CreatedAt = f.CreatedAt.Value.ConvertToVietnamTime()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<FeeScheduleDto>>.SuccessResponse(fees, "Danh sách khoản phí", total));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFeeScheduleDto dto)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var fee = await _context.FeeSchedules
                .Include(f => f.Club)
                .FirstOrDefaultAsync(f => f.FeeScheduleId == id && f.Status == "Active");

            if (fee == null) return NotFound(ApiResponse<object>.FailResponse("Khoản phí không tồn tại"));

            if (fee.Club!.PresidentId != CurrentUserId)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền chỉnh sửa khoản phí này"));

            if (fee.IsRequiredFee == false && dto.Frequency == "OneTime")
            {
                return BadRequest(ApiResponse<object>.FailResponse(
                    "Không thể chuyển khoản phí thường thành 'Phí tham gia CLB'. Vui lòng chỉnh sửa trong phần thông tin CLB."
                ));
            }

            fee.FeeName = dto.FeeName.Trim();
            fee.Amount = dto.Amount;
            fee.DueDate = DateOnly.FromDateTime(dto.DueDate);
            fee.Frequency = dto.Frequency;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResponse(null, "Cập nhật khoản phí thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var fee = await _context.FeeSchedules
                .Include(f => f.Club)
                .FirstOrDefaultAsync(f => f.FeeScheduleId == id);

            if (fee == null) return NotFound(ApiResponse<object>.FailResponse("Khoản phí không tồn tại"));

            if (fee.Club!.PresidentId != CurrentUserId)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền hủy khoản phí này"));

            if (fee.IsRequiredFee)
                return BadRequest(ApiResponse<object>.FailResponse("Không thể hủy 'Phí tham gia CLB'. Vui lòng chỉnh sửa trong thông tin CLB."));

            fee.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResponse(null, "Hủy khoản phí thành công"));
        }

        private static void FireAndForget(Func<Task> taskFunc)
        {
            Task.Run(async () =>
            {
                try
                {
                    await taskFunc();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"FireAndForget error: {ex}");
                }
            });
        }
    }
}