;; QuestHive Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-quest (err u101))
(define-constant err-already-completed (err u102))
(define-constant err-invalid-duration (err u103))
(define-constant min-duration u1)
(define-constant max-duration u30)
(define-constant streak-window u24) ;; hours to maintain streak

;; Data Variables
(define-data-var quest-counter uint u0)

;; Data Maps
(define-map quests uint {
  name: (string-ascii 50),
  reward: uint,
  duration: uint,
  creator: principal,
  active: bool
})

(define-map user-stats principal {
  completed-quests: uint,
  total-rewards: uint,
  current-streak: uint,
  last-completion: uint
})

(define-map quest-completions { quest-id: uint, user: principal } {
  completed-at: uint,
  rewarded: bool
})

;; Public Functions
(define-public (create-quest (name (string-ascii 50)) (reward uint) (duration uint))
  (begin
    (asserts! (and (>= duration min-duration) (<= duration max-duration)) err-invalid-duration)
    (let ((quest-id (var-get quest-counter)))
      (map-set quests quest-id {
        name: name,
        reward: reward,
        duration: duration,
        creator: tx-sender,
        active: true
      })
      (var-set quest-counter (+ quest-id u1))
      (ok quest-id)
    )
  )
)

(define-public (complete-quest (quest-id uint))
  (let (
    (quest (unwrap! (map-get? quests quest-id) err-invalid-quest))
    (completion-key { quest-id: quest-id, user: tx-sender })
  )
    (asserts! (get active quest) err-invalid-quest)
    (asserts! (is-none (map-get? quest-completions completion-key)) err-already-completed)
    
    (map-set quest-completions completion-key {
      completed-at: block-height,
      rewarded: true
    })
    
    (update-user-stats tx-sender (get reward quest))
    (ok true)
  )
)

(define-public (deactivate-quest (quest-id uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (match (map-get? quests quest-id)
      quest (ok (map-set quests quest-id (merge quest { active: false })))
      err-invalid-quest
    )
  )
)

;; Private Functions
(define-private (update-user-stats (user principal) (reward uint))
  (let (
    (current-stats (default-to {
      completed-quests: u0,
      total-rewards: u0,
      current-streak: u0,
      last-completion: u0
    } (map-get? user-stats user)))
    (current-time block-height)
    (last-completion (get last-completion current-stats))
    (new-streak (if (< (- current-time last-completion) streak-window)
      (+ (get current-streak current-stats) u1)
      u1))
  )
    (map-set user-stats user {
      completed-quests: (+ (get completed-quests current-stats) u1),
      total-rewards: (+ (get total-rewards current-stats) reward),
      current-streak: new-streak,
      last-completion: current-time
    })
  )
)

;; Read Only Functions
(define-read-only (get-quest (quest-id uint))
  (ok (map-get? quests quest-id))
)

(define-read-only (get-user-stats (user principal))
  (ok (map-get? user-stats user))
)

(define-read-only (get-completion-status (quest-id uint) (user principal))
  (ok (map-get? quest-completions { quest-id: quest-id, user: user }))
)
