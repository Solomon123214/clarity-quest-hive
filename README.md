# QuestHive
A gamified lifestyle app for tracking habits and daily goals built on the Stacks blockchain using Clarity.

## Features
- Create and manage daily quests/habits
- Track quest completion status
- Earn rewards for completing quests
- View quest history and statistics
- Leaderboard functionality

## Setup and Installation
1. Clone the repository
2. Install Clarinet using `curl -sS https://install.clarinet.com | sh`
3. Run `clarinet check` to verify the contracts
4. Run `clarinet test` to execute the test suite

## Usage Examples
```clarity
;; Create a new quest
(contract-call? .quest-hive create-quest "Exercise" u100 u7)

;; Complete a quest
(contract-call? .quest-hive complete-quest u1)

;; Get user stats
(contract-call? .quest-hive get-user-stats tx-sender)
```

## Smart Contract Design
The contract implements:
- Quest creation and management
- Quest completion tracking
- Reward distribution system
- User statistics and achievements
- Leaderboard rankings

## Dependencies
- Clarity language
- Clarinet for testing and deployment
