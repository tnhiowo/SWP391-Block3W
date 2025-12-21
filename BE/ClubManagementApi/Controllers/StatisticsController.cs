using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ClubManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubManagementApi.Controllers
{
    [Authorize]
    [Route("api/statistics")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly StudentClubContext _context;

        public StatisticsController(StudentClubContext context)
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
        private DateOnly Today => DateOnly.FromDateTime(TimeZoneHelper.NowInVietnam);

        [HttpGet("my-overview")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyOverview()
        {
            var myClubIds = await _context.ClubMembers
                .Where(cm => cm.UserId == CurrentUserId && cm.Status == "Approved")
                .Select(cm => cm.ClubId)
                .ToListAsync();

            var myClubs = await _context.Clubs
                .Where(c => myClubIds.Contains(c.ClubId))
                .Select(c => new
                {
                    c.ClubId,
                    c.ClubName,
                    c.Description,
                    MemberCount = c.ClubMembers.Count(m => m.Status == "Approved"),
                    PostCount = c.Posts.Count,
                    JoinedAt = _context.ClubMembers
                        .Where(m => m.ClubId == c.ClubId && m.UserId == CurrentUserId)
                        .Select(m => m.JoinedDate)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var totalPaid = await _context.Fees
                .CountAsync(f => f.UserId == CurrentUserId && f.PaymentStatus == "Paid");

            var totalPending = await _context.FeeSchedules
                .Where(fs => myClubIds.Contains(fs.ClubId) && fs.Status == "Active" &&
                            !_context.Fees.Any(f => f.FeeScheduleId == fs.FeeScheduleId && f.UserId == CurrentUserId && f.PaymentStatus == "Paid"))
                .CountAsync();

            var myPostsCount = await _context.Posts.CountAsync(p => p.UserId == CurrentUserId);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                TotalClubsJoined = myClubs.Count,
                TotalPostsCreated = myPostsCount,
                TotalFeesPaid = totalPaid,
                TotalFeesPending = totalPending,
                Clubs = myClubs.OrderByDescending(c => c.JoinedAt).Take(10)
            }, "Tổng quan hoạt động của bạn"));
        }

        [HttpGet("my-clubs")]
        [Authorize(Roles = "ClubLeader,Admin")]
        public async Task<IActionResult> GetMyClubsOverview()
        {
            var clubIds = User.IsInRole("Admin")
                ? await _context.Clubs.Select(c => c.ClubId).ToListAsync()
                : await _context.Clubs.Where(c => c.PresidentId == CurrentUserId).Select(c => c.ClubId).ToListAsync();

            var clubs = await _context.Clubs
                .Where(c => clubIds.Contains(c.ClubId))
                .Select(c => new
                {
                    c.ClubId,
                    c.ClubName,
                    MemberCount = c.ClubMembers.Count(m => m.Status == "Approved"),
                    TotalRevenue = c.Fees.Where(f => f.PaymentStatus == "Paid").Sum(f => f.Amount),
                    PendingFees = c.Fees.Count(f => f.PaymentStatus == "Pending"),
                    PostCount = c.Posts.Count,
                    JoinRequestCount = c.ClubJoinRequests.Count(r => r.Status == "Pending"),
                    TopActiveMembers = c.ClubMembers
                        .Where(m => m.Status == "Approved")
                        .OrderByDescending(m => m.User.Posts.Count(p => p.ClubId == c.ClubId))
                        .Take(3)
                        .Select(m => new
                        {
                            FullName = m.User.FullName,
                            PostCount = m.User.Posts.Count(p => p.ClubId == c.ClubId)
                        })
                        .ToList()
                })
                .OrderByDescending(c => c.TotalRevenue)
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse(clubs, "Tổng quan các CLB bạn quản lý"));
        }

        [HttpGet("club/{clubId}")]
        [Authorize(Roles = "ClubLeader,Admin")]
        public async Task<IActionResult> GetClubStatistics(int clubId)
        {
            var club = await _context.Clubs
                .Include(c => c.ClubMembers).ThenInclude(m => m.User)
                .Include(c => c.FeeSchedules).ThenInclude(fs => fs.Fees)
                .Include(c => c.Posts)
                .Include(c => c.ClubJoinRequests)
                .FirstOrDefaultAsync(c => c.ClubId == clubId);

            if (club == null)
                return NotFound(ApiResponse<object>.FailResponse("CLB không tồn tại"));

            if (User.IsInRole("ClubLeader") && club.PresidentId != CurrentUserId)
                return StatusCode(403, ApiResponse<object>.FailResponse("Bạn không có quyền xem thống kê của CLB này"));

            var totalMembers = club.ClubMembers.Count(m => m.Status == "Approved");
            var totalRevenue = club.Fees.Where(f => f.PaymentStatus == "Paid").Sum(f => f.Amount);

            var feeStats = club.FeeSchedules
                .Where(fs => fs.Status == "Active")
                .Select(fs => new
                {
                    fs.FeeName,
                    fs.Amount,
                    fs.DueDate,
                    PaidCount = fs.Fees.Count(f => f.PaymentStatus == "Paid"),
                    PendingCount = totalMembers - fs.Fees.Count(f => f.PaymentStatus == "Paid"),
                    CompletionRate = totalMembers > 0 ? Math.Round(100.0 * fs.Fees.Count(f => f.PaymentStatus == "Paid") / totalMembers, 1) : 0
                })
                .ToList();

            var topPosters = club.ClubMembers
                .Where(m => m.Status == "Approved")
                .OrderByDescending(m => m.User.Posts.Count(p => p.ClubId == clubId))
                .Take(5)
                .Select(m => new
                {
                    FullName = m.User.FullName,
                    PostCount = m.User.Posts.Count(p => p.ClubId == clubId),
                    Avatar = m.User.Avatar
                })
                .ToList();

            var recentActivity = club.Posts
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new
                {
                    p.Content,
                    Author = p.User.FullName,
                    CreatedAt = p.CreatedAt!.Value.ConvertToVietnamTime()
                })
                .ToList();

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                club.ClubId,
                club.ClubName,
                club.Description,
                TotalMembers = totalMembers,
                TotalRevenue = totalRevenue,
                TotalPosts = club.Posts.Count,
                PendingJoinRequests = club.ClubJoinRequests.Count(r => r.Status == "Pending"),
                FeeStatistics = feeStats,
                TopActiveMembers = topPosters,
                RecentActivity = recentActivity
            }));
        }

        [HttpGet("global")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetGlobalStatistics()
        {
            var totalClubs = await _context.Clubs.CountAsync();
            var totalMembers = await _context.ClubMembers.CountAsync(cm => cm.Status == "Approved");
            var totalRevenue = await _context.Fees.Where(f => f.PaymentStatus == "Paid").SumAsync(f => f.Amount);

            var monthlyRevenue = await _context.Fees
                .Where(f => f.PaymentStatus == "Paid" && f.PaidAt.HasValue)
                .GroupBy(f => new { f.PaidAt.Value.Year, f.PaidAt.Value.Month })
                .Select(g => new
                {
                    Period = $"{g.Key.Month:00}/{g.Key.Year}",
                    Revenue = g.Sum(f => f.Amount),
                    Transactions = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToListAsync();

            var clubRanking = await _context.Clubs
                .Select(c => new
                {
                    c.ClubId,
                    c.ClubName,
                    MemberCount = c.ClubMembers.Count(m => m.Status == "Approved"),
                    Revenue = c.Fees.Where(f => f.PaymentStatus == "Paid").Sum(f => f.Amount),
                    PostCount = c.Posts.Count
                })
                .OrderByDescending(c => c.Revenue)
                .Take(10)
                .ToListAsync();

            var activityLast7Days = await _context.Posts
                .Where(p => p.CreatedAt >= TimeZoneHelper.NowInVietnam.AddDays(-7))
                .CountAsync();

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                TotalClubs = totalClubs,
                TotalMembers = totalMembers,
                TotalRevenue = totalRevenue,
                ActivityLast7Days = activityLast7Days,
                MonthlyRevenueTrend = monthlyRevenue,
                Top10Clubs = clubRanking
            }, "Thống kê toàn hệ thống"));
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Admin,ClubLeader")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            if (User.IsInRole("Admin"))
            {
                var todayRevenueq = await _context.Fees
                    .Where(f => f.PaymentStatus == "Paid")
                    .SumAsync(f => f.Amount);

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    Role = "Admin",
                    TodayRevenue = todayRevenueq,
                    TotalClubs = await _context.Clubs.CountAsync(),
                    NewMembersToday = await _context.ClubMembers.CountAsync(cm => cm.JoinedDate.HasValue && cm.JoinedDate.Value.Date == TimeZoneHelper.NowInVietnam.Date),
                    PendingRequests = await _context.ClubJoinRequests.CountAsync(r => r.Status == "Pending")
                }));
            }

            var myClubIds = await _context.Clubs
                .Where(c => c.PresidentId == CurrentUserId)
                .Select(c => c.ClubId)
                .ToListAsync();

            var todayRevenue = await _context.Fees
                .Where(f => myClubIds.Contains(f.ClubId) && f.PaymentStatus == "Paid" && f.PaidAt.HasValue && f.PaidAt.Value.Date == TimeZoneHelper.NowInVietnam.Date)
                .SumAsync(f => f.Amount);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                Role = "ClubLeader",
                MyClubCount = myClubIds.Count,
                TotalMembers = await _context.ClubMembers.CountAsync(cm => myClubIds.Contains(cm.ClubId) && cm.Status == "Approved"),
                TodayRevenue = todayRevenue,
                PendingRequests = await _context.ClubJoinRequests.CountAsync(r => myClubIds.Contains(r.ClubId) && r.Status == "Pending")
            }));
        }
    }
}