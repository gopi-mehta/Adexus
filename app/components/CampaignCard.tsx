import { Campaign } from "../lib/dataService";
import { Card, CardBody, CardFooter } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Progress } from "./ui/Progress";
import styles from "./CampaignCard.module.css";

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
  isCompleted?: boolean;
}

const typeIcons: Record<string, string> = {
  video: "🎥",
  survey: "📊",
  share: "📢",
  quiz: "❓",
};

const typeLabels: Record<string, string> = {
  video: "Watch",
  survey: "Survey",
  share: "Share",
  quiz: "Quiz",
};

export function CampaignCard({
  campaign,
  onClick,
  isCompleted = false,
}: CampaignCardProps) {
  const progress =
    (campaign.participantsCount / campaign.maxParticipants) * 100;

  return (
    <Card onClick={onClick} variant="elevated">
      <CardBody>
        <div className={styles.header}>
          <div className={styles.brandInfo}>
            <span className={styles.brandLogo}>{campaign.brandLogo}</span>
            <div>
              <h3 className={styles.brandName}>{campaign.brandName}</h3>
              <div className={styles.badges}>
                <Badge variant="info" size="sm">
                  {typeIcons[campaign.type]} {typeLabels[campaign.type]}
                </Badge>
                <Badge variant="default" size="sm">
                  {campaign.duration} min
                </Badge>
              </div>
            </div>
          </div>
          <div className={styles.reward}>
            <div className={styles.rewardAmount}>
              +{campaign.reward} {campaign.rewardToken || "ETH"}
            </div>
            <div className={styles.rewardToken}>{campaign.rewardToken}</div>
          </div>
        </div>

        <h4 className={styles.title}>{campaign.title}</h4>
        <p className={styles.description}>{campaign.description}</p>

        <div className={styles.tags}>
          {campaign.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      </CardBody>

      <CardFooter>
        <div className={styles.footer}>
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.participants}>
                {campaign.participantsCount.toLocaleString()} participants
              </span>
              <span className={styles.spots}>
                {(
                  campaign.maxParticipants - campaign.participantsCount
                ).toLocaleString()}{" "}
                spots left
              </span>
            </div>
            <Progress
              value={progress}
              variant={progress > 80 ? "warning" : "primary"}
            />
          </div>
          {isCompleted && (
            <Badge variant="success" size="sm">
              ✓ Completed
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
