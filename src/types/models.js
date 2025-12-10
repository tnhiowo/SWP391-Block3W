// Tạm thời dùng file .js với JSDoc type để phù hợp codebase hiện tại (chưa dùng TypeScript).
// Khi migrate sang TS có thể đổi sang models.ts và dùng interface/type trực tiếp.

/**
 * @typedef {'STUDENT' | 'CLUB_LEADER' | 'ADMIN'} UserRole
 */

/**
 * @typedef {'ACTIVE' | 'INACTIVE' | 'LOCKED'} AccountStatus
 */

/**
 * @typedef {Object} User
 * @property {number} userId
 * @property {string} fullName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [avatar]
 * @property {string} [passwordHash]
 * @property {UserRole} role
 * @property {AccountStatus} accountStatus
 * @property {string} createdAt
 * @property {string} [lastLogin]
 */

/**
 * @typedef {Object} Club
 * @property {number} clubId
 * @property {string} clubName
 * @property {string} [description]
 * @property {number} presidentId
 * @property {'ACTIVE' | 'INACTIVE'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ClubMember
 * @property {number} memberId
 * @property {number} clubId
 * @property {number} userId
 * @property {string} joinedDate
 * @property {'ACTIVE' | 'INACTIVE'} status
 */

/**
 * @typedef {Object} ClubJoinRequest
 * @property {number} requestId
 * @property {number} userId
 * @property {number} clubId
 * @property {string} studentId
 * @property {string} [major]
 * @property {string} [reason]
 * @property {'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'} status
 * @property {string} createdAt
 */

// Các type khác theo ERD, định nghĩa field chính để dùng dần:

/**
 * @typedef {Object} FeeSchedule
 * @property {number} scheduleId
 * @property {number} clubId
 * @property {string} title
 * @property {string} dueDate
 */

/**
 * @typedef {Object} Fee
 * @property {number} feeId
 * @property {number} scheduleId
 * @property {number} memberId
 * @property {number} amount
 * @property {'PENDING' | 'PAID' | 'OVERDUE'} status
 */

/**
 * @typedef {Object} Notification
 * @property {number} notificationId
 * @property {number} userId
 * @property {string} title
 * @property {string} content
 * @property {boolean} isRead
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Post
 * @property {number} postId
 * @property {number} clubId
 * @property {number} authorId
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PostImage
 * @property {number} imageId
 * @property {number} postId
 * @property {string} imageUrl
 */

/**
 * @typedef {Object} ApprovalRequest
 * @property {number} approvalId
 * @property {number} requesterId
 * @property {string} targetType
 * @property {number} targetId
 * @property {'PENDING' | 'APPROVED' | 'REJECTED'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} UserToken
 * @property {number} tokenId
 * @property {number} userId
 * @property {string} token
 * @property {string} expiresAt
 */

// Export rỗng để file được xem là module
export {};


