// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CampaignRegistry
 * @dev Manages campaigns where creators fund rewards and users complete tasks to earn tokens
 */
contract CampaignRegistry is Ownable, ReentrancyGuard {
    struct Campaign {
        uint256 id;
        address creator;
        string metadataURI; // IPFS hash or URL to campaign details
        uint8 campaignType; // 0: video, 1: survey, 2: quiz, 3: share
        address rewardToken; // address(0) for ETH, ERC20 address otherwise
        uint256 rewardAmount; // reward per completion
        uint256 maxParticipants;
        uint256 participantsCount;
        uint256 expiresAt;
        bool isActive;
        uint256 totalFunded; // total tokens deposited by creator
        uint256 totalPaid; // total tokens paid out
    }

    struct Participation {
        uint256 campaignId;
        address participant;
        uint256 completedAt;
        bool rewarded;
    }

    // State variables
    uint256 public campaignCounter;
    uint256 public platformFeePercentage = 250; // 2.5% (basis points)
    address public platformFeeRecipient;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    mapping(uint256 => mapping(address => Participation)) public participations;
    mapping(address => uint256[]) public userCompletedCampaigns;
    mapping(address => uint256) public userTotalEarnings;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string metadataURI,
        uint8 campaignType,
        address rewardToken,
        uint256 rewardAmount,
        uint256 maxParticipants
    );
    
    event CampaignFunded(
        uint256 indexed campaignId,
        address indexed funder,
        uint256 amount
    );
    
    event CampaignCompleted(
        uint256 indexed campaignId,
        address indexed participant,
        uint256 reward
    );
    
    event CampaignStatusChanged(
        uint256 indexed campaignId,
        bool isActive
    );
    
    event RewardClaimed(
        uint256 indexed campaignId,
        address indexed participant,
        uint256 amount
    );

    event PlatformFeeUpdated(uint256 newFeePercentage);
    event PlatformFeeRecipientUpdated(address newRecipient);

    constructor() Ownable(msg.sender) {
        platformFeeRecipient = msg.sender;
    }

    /**
     * @dev Create a new campaign
     * @param metadataURI IPFS hash or URL containing campaign details
     * @param campaignType Type of campaign (0: video, 1: survey, 2: quiz, 3: share)
     * @param rewardToken Address of reward token (address(0) for ETH)
     * @param rewardAmount Reward amount per completion
     * @param maxParticipants Maximum number of participants
     * @param expiresAt Expiration timestamp
     */
    function createCampaign(
        string memory metadataURI,
        uint8 campaignType,
        address rewardToken,
        uint256 rewardAmount,
        uint256 maxParticipants,
        uint256 expiresAt
    ) external payable returns (uint256) {
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        require(campaignType <= 3, "Invalid campaign type");
        require(rewardAmount > 0, "Reward must be > 0");
        require(maxParticipants > 0, "Max participants must be > 0");
        require(expiresAt > block.timestamp, "Expiration must be in future");

        campaignCounter++;
        uint256 campaignId = campaignCounter;

        campaigns[campaignId] = Campaign({
            id: campaignId,
            creator: msg.sender,
            metadataURI: metadataURI,
            campaignType: campaignType,
            rewardToken: rewardToken,
            rewardAmount: rewardAmount,
            maxParticipants: maxParticipants,
            participantsCount: 0,
            expiresAt: expiresAt,
            isActive: true,
            totalFunded: 0,
            totalPaid: 0
        });

        emit CampaignCreated(
            campaignId,
            msg.sender,
            metadataURI,
            campaignType,
            rewardToken,
            rewardAmount,
            maxParticipants
        );

        // If ETH is sent, treat it as initial funding
        if (msg.value > 0) {
            require(rewardToken == address(0), "ETH sent but ERC20 campaign");
            campaigns[campaignId].totalFunded = msg.value;
            emit CampaignFunded(campaignId, msg.sender, msg.value);
        }

        return campaignId;
    }

    /**
     * @dev Fund a campaign with rewards
     * @param campaignId ID of the campaign to fund
     * @param amount Amount to fund (for ERC20 tokens)
     */
    function fundCampaign(uint256 campaignId, uint256 amount) external payable {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.isActive, "Campaign is not active");

        if (campaign.rewardToken == address(0)) {
            // ETH funding
            require(msg.value > 0, "Must send ETH");
            campaign.totalFunded += msg.value;
            emit CampaignFunded(campaignId, msg.sender, msg.value);
        } else {
            // ERC20 funding
            require(amount > 0, "Amount must be > 0");
            IERC20(campaign.rewardToken).transferFrom(msg.sender, address(this), amount);
            campaign.totalFunded += amount;
            emit CampaignFunded(campaignId, msg.sender, amount);
        }
    }

    /**
     * @dev Complete a campaign and claim reward
     * @param campaignId ID of the campaign
     */
    function completeCampaign(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp < campaign.expiresAt, "Campaign has expired");
        require(!hasParticipated[campaignId][msg.sender], "Already participated");
        require(campaign.participantsCount < campaign.maxParticipants, "Campaign is full");
        
        // Calculate platform fee
        uint256 platformFee = (campaign.rewardAmount * platformFeePercentage) / 10000;
        uint256 userReward = campaign.rewardAmount - platformFee;
        
        // Check if campaign has enough funds
        uint256 availableFunds = campaign.totalFunded - campaign.totalPaid;
        require(availableFunds >= campaign.rewardAmount, "Insufficient campaign funds");

        // Mark as participated
        hasParticipated[campaignId][msg.sender] = true;
        campaign.participantsCount++;
        campaign.totalPaid += campaign.rewardAmount;

        // Record participation
        participations[campaignId][msg.sender] = Participation({
            campaignId: campaignId,
            participant: msg.sender,
            completedAt: block.timestamp,
            rewarded: true
        });

        userCompletedCampaigns[msg.sender].push(campaignId);
        userTotalEarnings[msg.sender] += userReward;

        // Transfer rewards
        if (campaign.rewardToken == address(0)) {
            // ETH reward
            payable(msg.sender).transfer(userReward);
            if (platformFee > 0) {
                payable(platformFeeRecipient).transfer(platformFee);
            }
        } else {
            // ERC20 reward
            IERC20(campaign.rewardToken).transfer(msg.sender, userReward);
            if (platformFee > 0) {
                IERC20(campaign.rewardToken).transfer(platformFeeRecipient, platformFee);
            }
        }

        emit CampaignCompleted(campaignId, msg.sender, userReward);
        emit RewardClaimed(campaignId, msg.sender, userReward);
    }

    /**
     * @dev Toggle campaign active status (only creator)
     */
    function toggleCampaignStatus(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.creator == msg.sender, "Not campaign creator");

        campaign.isActive = !campaign.isActive;
        emit CampaignStatusChanged(campaignId, campaign.isActive);
    }

    /**
     * @dev Withdraw unused funds from campaign (only creator)
     */
    function withdrawUnusedFunds(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.creator == msg.sender, "Not campaign creator");
        require(!campaign.isActive || block.timestamp >= campaign.expiresAt, "Campaign still active");

        uint256 unusedFunds = campaign.totalFunded - campaign.totalPaid;
        require(unusedFunds > 0, "No unused funds");

        campaign.totalFunded = campaign.totalPaid;

        if (campaign.rewardToken == address(0)) {
            payable(msg.sender).transfer(unusedFunds);
        } else {
            IERC20(campaign.rewardToken).transfer(msg.sender, unusedFunds);
        }
    }

    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    /**
     * @dev Get user's completed campaigns
     */
    function getUserCompletedCampaigns(address user) external view returns (uint256[] memory) {
        return userCompletedCampaigns[user];
    }

    /**
     * @dev Check if user has participated in a campaign
     */
    function userHasParticipated(uint256 campaignId, address user) external view returns (bool) {
        return hasParticipated[campaignId][user];
    }

    /**
     * @dev Get available funds for a campaign
     */
    function getAvailableFunds(uint256 campaignId) external view returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        return campaign.totalFunded - campaign.totalPaid;
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    /**
     * @dev Update platform fee recipient (only owner)
     */
    function updatePlatformFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        platformFeeRecipient = newRecipient;
        emit PlatformFeeRecipientUpdated(newRecipient);
    }

    /**
     * @dev Get multiple campaigns
     */
    function getCampaigns(uint256 startId, uint256 count) external view returns (Campaign[] memory) {
        require(startId > 0 && startId <= campaignCounter, "Invalid start ID");
        
        uint256 endId = startId + count - 1;
        if (endId > campaignCounter) {
            endId = campaignCounter;
        }
        
        uint256 resultCount = endId - startId + 1;
        Campaign[] memory result = new Campaign[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = campaigns[startId + i];
        }
        
        return result;
    }
}

