using ClubManagementApi.Models;
using ClubManagementApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Net.payOS.Types;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ClubManagementApi.Controllers
{
    [Authorize]
    [Route("api/fees")]
    [ApiController]
    public class FeesController : ControllerBase
    {
        private readonly StudentClubContext _context;
        private readonly PayOSService _payOSService;
        private readonly IConfiguration _config;

        public FeesController(StudentClubContext context, PayOSService payOSService, IConfiguration config)
        {
            _context = context;
            _payOSService = payOSService;
            _config = config;
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
                throw new UnauthorizedAccessException("ID người dùng không hợp lệ");
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
        private DateOnly Today => DateOnly.FromDateTime(TimeZoneHelper.NowInVietnam);

        public class CreatePaymentDto
        {
            [Required(ErrorMessage = "ID khoản phí là bắt buộc")]
            [Range(1, int.MaxValue, ErrorMessage = "ID khoản phí không hợp lệ")]
            public int FeeScheduleId { get; set; }
        }

        public class PaginationParams
        {
            [Range(1, int.MaxValue, ErrorMessage = "Số trang phải lớn hơn 0")]
            public int PageNumber { get; set; } = 1;

            [Range(1, 100, ErrorMessage = "Kích thước trang từ 1 đến 100")]
            public int PageSize { get; set; } = 10;

            public string? Search { get; set; }
        }

        public class FeeDto
        {
            public int FeeScheduleId { get; set; }
            public int ClubId { get; set; }
            public string ClubName { get; set; } = string.Empty;
            public string FeeName { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public DateOnly DueDate { get; set; }
            public string Frequency { get; set; } = string.Empty;
            public string PaymentStatus { get; set; } = string.Empty;
            public int DaysUntilDue { get; set; }
            public DateTime? PaidAt { get; set; }
        }

        public class PaymentResponseDto
        {
            public int FeeId { get; set; }
            public int FeeScheduleId { get; set; }
            public string ClubName { get; set; } = string.Empty;
            public string FeeName { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string PaymentLink { get; set; } = string.Empty;
            public int OrderCode { get; set; }
        }

        public class PaymentDto
        {
            public int FeeId { get; set; }
            public int FeeScheduleId { get; set; }
            public string FeeName { get; set; } = string.Empty;
            public int ClubId { get; set; }
            public string ClubName { get; set; } = string.Empty;
            public int UserId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string PaymentStatus { get; set; } = string.Empty;
            public DateTime? PaidAt { get; set; }
            public int OrderCode { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // ==================== HÀM HỖ TRỢ ====================

        private IActionResult ValidationErrorResponse()
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Message = x.Value?.Errors.First().ErrorMessage })
                .ToList();

            return BadRequest(ApiResponse<object>.FailResponse("Dữ liệu không hợp lệ", errors));
        }

        // ==================== CÁC ENDPOINT ====================

        [HttpPost("pay")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var feeSchedule = await _context.FeeSchedules
                    .Include(f => f.Club)
                    .FirstOrDefaultAsync(f => f.FeeScheduleId == dto.FeeScheduleId && f.Status == "Active");

                if (feeSchedule == null)
                    return NotFound(ApiResponse<object>.FailResponse("Khoản phí không tồn tại hoặc đã hết hiệu lực"));

                var isMember = await _context.ClubMembers
                    .AnyAsync(m => m.ClubId == feeSchedule.ClubId && m.UserId == CurrentUserId && m.Status == "Approved");

                if (!isMember)
                    return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không phải thành viên của câu lạc bộ này"));

                var alreadyPaid = await _context.Fees.AnyAsync(f =>
                    f.FeeScheduleId == dto.FeeScheduleId &&
                    f.UserId == CurrentUserId &&
                    f.PaymentStatus == "Paid");

                if (alreadyPaid)
                    return BadRequest(ApiResponse<object>.FailResponse("Bạn đã đóng khoản phí này rồi"));

                var orderCode = new Random().Next(100000, 999999);

                var feeRecord = new Fee
                {
                    FeeScheduleId = feeSchedule.FeeScheduleId,
                    ClubId = feeSchedule.ClubId,
                    UserId = CurrentUserId,
                    OrderCode = orderCode,
                    Amount = feeSchedule.Amount,
                    FeeType = "Membership",
                    PaymentStatus = "Pending",
                    CreatedAt = TimeZoneHelper.NowInVietnam
                };

                _context.Fees.Add(feeRecord);
                await _context.SaveChangesAsync();

                var items = new List<ItemData>
                {
                    new ItemData(
                        name: $"{feeSchedule.FeeName} - {feeSchedule.Club.ClubName}",
                        quantity: 1,
                        price: (int)feeSchedule.Amount
                    )
                };

                var baseUrl = _config["AppSettings:FrontendUrl"]?.TrimEnd('/');
                var cancelUrl = $"{baseUrl}?orderCode={orderCode}&status=cancelled";
                var successUrl = $"{baseUrl}?orderCode={orderCode}&status=paid";

                var paymentResult = await _payOSService.CreatePaymentLink(
                    orderCode,
                    feeSchedule.Amount,
                    $"Thanh toán phí CLB",
                    items,
                    cancelUrl,
                    successUrl
                );

                await transaction.CommitAsync();

                var response = new PaymentResponseDto
                {
                    FeeId = feeRecord.FeeId,
                    FeeScheduleId = feeSchedule.FeeScheduleId,
                    ClubName = feeSchedule.Club.ClubName,
                    FeeName = feeSchedule.FeeName,
                    Amount = feeSchedule.Amount,
                    PaymentLink = paymentResult.checkoutUrl,
                    OrderCode = orderCode
                };

                return Ok(ApiResponse<PaymentResponseDto>.SuccessResponse(
                    response,
                    "Tạo link thanh toán thành công"
                ));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<object>.FailResponse("Lỗi hệ thống khi tạo thanh toán: " + ex.Message));
            }
        }

        [HttpGet("payment-status/{orderCode}")]
        public async Task<IActionResult> CheckPaymentStatus(int orderCode)
        {
            if (orderCode < 100000 || orderCode > 999999)
                return BadRequest(ApiResponse<object>.FailResponse("Mã đơn hàng không hợp lệ"));

            var feeRecord = await _context.Fees
                .Include(f => f.FeeSchedule)
                    .ThenInclude(fs => fs!.Club)
                .FirstOrDefaultAsync(f => f.OrderCode == orderCode);

            if (feeRecord == null)
                return NotFound(ApiResponse<object>.FailResponse("Không tìm thấy khoản phí với mã này"));

            if (feeRecord.UserId != CurrentUserId && !User.IsInRole("Admin"))
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền xem trạng thái thanh toán này"));

            try
            {
                var paymentInfo = await _payOSService.GetPaymentLinkInformation(orderCode);

                if (paymentInfo.status == "PAID")
                {
                    if (paymentInfo.amount != feeRecord.Amount)
                    {
                        return BadRequest(ApiResponse<object>.FailResponse(
                            "Số tiền thanh toán không khớp với khoản phí. Vui lòng thanh toán đúng số tiền yêu cầu."
                        ));
                    }

                    if (feeRecord.PaymentStatus == "Paid")
                    {
                        return Ok(ApiResponse<object>.SuccessResponse(new
                        {
                            Status = "Paid",
                            PaidAt = feeRecord.PaidAt,
                            Message = "Khoản phí đã được thanh toán trước đó."
                        }));
                    }

                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        feeRecord.PaymentStatus = "Paid";
                        feeRecord.PaidAt = TimeZoneHelper.NowInVietnam;

                        _context.Notifications.Add(new Notification
                        {
                            UserId = feeRecord.UserId,
                            Title = "Thanh toán thành công!",
                            Message = $"Bạn đã đóng thành công khoản phí \"{feeRecord.FeeSchedule.FeeName}\" - {feeRecord.FeeSchedule.Club.ClubName} với số tiền {feeRecord.Amount:N0}đ",
                            IsRead = false,
                            CreatedAt = TimeZoneHelper.NowInVietnam
                        });

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }

                    return Ok(ApiResponse<object>.SuccessResponse(new
                    {
                        Status = "Paid",
                        PaidAt = feeRecord.PaidAt,
                        Message = "Thanh toán thành công! Cảm ơn bạn đã đóng phí."
                    }));
                }
                else if (paymentInfo.status == "CANCELLED" || paymentInfo.status == "EXPIRED")
                {
                    if (feeRecord.PaymentStatus != "Cancelled")
                    {
                        feeRecord.PaymentStatus = "Cancelled";
                        await _context.SaveChangesAsync();
                    }

                    return Ok(ApiResponse<object>.SuccessResponse(new
                    {
                        Status = paymentInfo.status,
                        Message = paymentInfo.status == "CANCELLED" ? "Bạn đã hủy thanh toán" : "Link thanh toán đã hết hạn"
                    }));
                }
                else
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new
                    {
                        Status = paymentInfo.status,
                        Message = "Chưa thanh toán"
                    }));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse("Lỗi kiểm tra trạng thái thanh toán: " + ex.Message));
            }
        }

        [HttpGet("my-fees")]
        public async Task<IActionResult> GetMyFees(
            [FromQuery] PaginationParams p,
            [FromQuery] string status = "pending")
        {
            if (!ModelState.IsValid)
                return ValidationErrorResponse();

            var today = Today;

            var schedules = await (
                from cm in _context.ClubMembers
                join fs in _context.FeeSchedules on cm.ClubId equals fs.ClubId
                join c in _context.Clubs on cm.ClubId equals c.ClubId
                where cm.UserId == CurrentUserId
                   && cm.Status == "Approved"
                   && fs.Status == "Active"
                select new
                {
                    fs.FeeScheduleId,
                    fs.FeeName,
                    fs.Amount,
                    fs.Frequency,
                    fs.DueDate,
                    c.ClubId,
                    c.ClubName
                }
            )
            .Distinct()         
            .AsNoTracking()
            .ToListAsync();


            var latestFees = await _context.Fees
                .Where(f => f.UserId == CurrentUserId)
                .GroupBy(f => f.FeeScheduleId)
                .Select(g => g
                    .OrderByDescending(x => x.FeeId)
                    .First())
                .AsNoTracking()
                .ToListAsync();

            var feeDict = latestFees.ToDictionary(x => x.FeeScheduleId);


            var result = schedules
                .Select(s =>
                {
                    feeDict.TryGetValue(s.FeeScheduleId, out var fee);

                    int daysUntilDue = s.DueDate.DayNumber - today.DayNumber;

                    string paymentStatus =
                        fee?.PaymentStatus ??
                        (daysUntilDue < 0 ? "Overdue" :
                         daysUntilDue <= 3 ? "DueSoon" :
                         "Pending");

                    return new FeeDto
                    {
                        FeeScheduleId = s.FeeScheduleId,
                        ClubId = s.ClubId,
                        ClubName = s.ClubName,
                        FeeName = s.FeeName,
                        Amount = s.Amount,
                        DueDate = s.DueDate,
                        Frequency = s.Frequency,
                        PaymentStatus = paymentStatus,
                        DaysUntilDue = daysUntilDue,
                        PaidAt = fee?.PaidAt
                    };
                })
                .Where(x =>
                    status == "paid" ? x.PaymentStatus == "Paid" :
                    status == "cancelled" ? x.PaymentStatus == "Cancelled" :
                    x.PaymentStatus is "Pending" or "DueSoon" or "Overdue"
                )
                .ToList();

            var total = result.Count;

            var paginated = result
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .ToList();

            return Ok(
                ApiResponse<List<FeeDto>>
                    .SuccessResponse(paginated, "Danh sách phí", total)
            );
        }

        [HttpGet("my-pending-fees")]
        public async Task<IActionResult> GetMyPendingFees()
        {
            var today = Today;

            var pendingFees = await (
                from cm in _context.ClubMembers
                join fs in _context.FeeSchedules on cm.ClubId equals fs.ClubId
                join c in _context.Clubs on fs.ClubId equals c.ClubId
                where cm.UserId == CurrentUserId
                   && cm.Status == "Approved"
                   && fs.Status == "Active"
                   && fs.DueDate >= today
                   && !_context.Fees.Any(f => f.FeeScheduleId == fs.FeeScheduleId && f.UserId == CurrentUserId && f.PaymentStatus == "Paid")
                select new FeeDto
                {
                    FeeScheduleId = fs.FeeScheduleId,
                    ClubId = c.ClubId,
                    ClubName = c.ClubName,
                    FeeName = fs.FeeName,
                    Amount = fs.Amount,
                    DueDate = fs.DueDate,
                    Frequency = fs.Frequency,
                    PaymentStatus = fs.DueDate.DayNumber - today.DayNumber <= 3 ? "DueSoon" : "Pending",
                    DaysUntilDue = fs.DueDate.DayNumber - today.DayNumber,
                    PaidAt = null
                })
                .OrderBy(f => f.DueDate)
                .Take(10)
                .ToListAsync();

            return Ok(ApiResponse<List<FeeDto>>.SuccessResponse(pendingFees, "Các khoản phí cần đóng sắp tới"));
        }

        [HttpGet("{scheduleId}")]
        public async Task<IActionResult> GetFeeDetail(int scheduleId)
        {
            var fee = await _context.FeeSchedules
                .Include(f => f.Club)
                .FirstOrDefaultAsync(f => f.FeeScheduleId == scheduleId && f.Status == "Active");

            if (fee == null) return NotFound(ApiResponse<object>.FailResponse("Khoản phí không tồn tại"));

            var isMember = await _context.ClubMembers
                .AnyAsync(m => m.ClubId == fee.ClubId && m.UserId == CurrentUserId && m.Status == "Approved");

            if (!isMember)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không phải thành viên của CLB này"));

            var myStatus = await _context.Fees.AnyAsync(f =>
                f.FeeScheduleId == scheduleId && f.UserId == CurrentUserId && f.PaymentStatus == "Paid")
                ? "Paid" : (fee.DueDate < Today ? "Overdue" : "Pending");

            var dto = new
            {
                fee.FeeScheduleId,
                fee.ClubId,
                ClubName = fee.Club!.ClubName,
                fee.FeeName,
                fee.Amount,
                DueDate = fee.DueDate.ToDateTime(TimeOnly.MinValue),
                fee.Frequency,
                fee.Status,
                CreatedAt = fee.CreatedAt.Value.ConvertToVietnamTime(),
                MyPaymentStatus = myStatus
            };

            return Ok(ApiResponse<object>.SuccessResponse(dto));
        }

        [Authorize(Roles = "ClubLeader,Admin")]
        [HttpGet("{scheduleId}/payments")]
        public async Task<IActionResult> GetPaymentsForSchedule(int scheduleId, [FromQuery] PaginationParams p)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var feeSchedule = await _context.FeeSchedules
                .Include(f => f.Club)
                .FirstOrDefaultAsync(f => f.FeeScheduleId == scheduleId && f.Status == "Active");

            if (feeSchedule == null)
                return NotFound(ApiResponse<object>.FailResponse("Khoản phí không tồn tại"));

            if (User.IsInRole("ClubLeader") && feeSchedule.Club.PresidentId != CurrentUserId)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền xem thanh toán của khoản phí này"));

            var query = from fee in _context.Fees
                        join fs in _context.FeeSchedules on fee.FeeScheduleId equals fs.FeeScheduleId
                        join u in _context.Users on fee.UserId equals u.UserId
                        join cm in _context.ClubMembers on new { fee.UserId, fee.ClubId } equals new { cm.UserId, cm.ClubId }
                        where fee.FeeScheduleId == scheduleId && cm.Status == "Approved"
                        select new
                        {
                            fee.FeeId,
                            fee.FeeScheduleId,
                            fs.FeeName,
                            fee.ClubId,
                            ClubName = feeSchedule.Club.ClubName,
                            fee.UserId,
                            FullName = u.FullName,
                            Email = u.Email,
                            fee.Amount,
                            fee.PaymentStatus,
                            fee.PaidAt,
                            fee.OrderCode,
                            fee.CreatedAt
                        };

            if (!string.IsNullOrEmpty(p.Search))
            {
                var search = p.Search.Trim().ToLower();
                query = query.Where(x =>
                    x.FullName.ToLower().Contains(search) ||
                    x.Email.ToLower().Contains(search) ||
                    x.FeeName.ToLower().Contains(search));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.PaidAt ?? x.CreatedAt)
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .ToListAsync();

            var payments = data.Select(x => new PaymentDto
            {
                FeeId = x.FeeId,
                FeeScheduleId = x.FeeScheduleId,
                FeeName = x.FeeName,
                ClubId = x.ClubId,
                ClubName = x.ClubName,
                UserId = x.UserId,
                FullName = x.FullName ?? "Chưa có tên",
                Email = x.Email,
                Amount = x.Amount,
                PaymentStatus = x.PaymentStatus,
                PaidAt = x.PaidAt,
                OrderCode = x.OrderCode,
                CreatedAt = x.CreatedAt.Value.ConvertToVietnamTime()
            }).ToList();

            return Ok(ApiResponse<List<PaymentDto>>.SuccessResponse(payments, "Danh sách thanh toán", total));
        }

        [Authorize(Roles = "ClubLeader,Admin")]
        [HttpGet("club/{clubId}/payments")]
        public async Task<IActionResult> GetClubPayments(int clubId, [FromQuery] PaginationParams p)
        {
            if (!ModelState.IsValid) return ValidationErrorResponse();

            var club = await _context.Clubs.FirstOrDefaultAsync(c => c.ClubId == clubId);
            if (club == null)
                return NotFound(ApiResponse<object>.FailResponse("CLB không tồn tại"));

            if (User.IsInRole("ClubLeader") && club.PresidentId != CurrentUserId)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền xem thanh toán của CLB này"));

            var query = from fee in _context.Fees
                        join fs in _context.FeeSchedules on fee.FeeScheduleId equals fs.FeeScheduleId
                        join u in _context.Users on fee.UserId equals u.UserId
                        join cm in _context.ClubMembers on new { fee.UserId, fee.ClubId } equals new { cm.UserId, cm.ClubId }
                        where fee.ClubId == clubId && cm.Status == "Approved"
                        select new
                        {
                            fee.FeeId,
                            fee.FeeScheduleId,
                            fs.FeeName,
                            fee.ClubId,
                            ClubName = club.ClubName,
                            fee.UserId,
                            FullName = u.FullName,
                            Email = u.Email,
                            fee.Amount,
                            fee.PaymentStatus,
                            fee.PaidAt,
                            fee.OrderCode,
                            fee.CreatedAt
                        };

            if (!string.IsNullOrEmpty(p.Search))
            {
                var search = p.Search.Trim().ToLower();
                query = query.Where(x =>
                    x.FullName.ToLower().Contains(search) ||
                    x.Email.ToLower().Contains(search) ||
                    x.FeeName.ToLower().Contains(search));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.PaidAt ?? x.CreatedAt)
                .Skip((p.PageNumber - 1) * p.PageSize)
                .Take(p.PageSize)
                .ToListAsync();

            var payments = data.Select(x => new PaymentDto
            {
                FeeId = x.FeeId,
                FeeScheduleId = x.FeeScheduleId,
                FeeName = x.FeeName,
                ClubId = x.ClubId,
                ClubName = x.ClubName,
                UserId = x.UserId,
                FullName = x.FullName ?? "Chưa có tên",
                Email = x.Email,
                Amount = x.Amount,
                PaymentStatus = x.PaymentStatus,
                PaidAt = x.PaidAt,
                OrderCode = x.OrderCode,
                CreatedAt = x.CreatedAt.Value.ConvertToVietnamTime()
            }).ToList();

            return Ok(ApiResponse<List<PaymentDto>>.SuccessResponse(payments, "Danh sách thanh toán của CLB", total));
        }
    }
}