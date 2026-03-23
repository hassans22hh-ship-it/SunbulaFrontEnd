import { GrowthStage, PlantLevel } from './enums';

export interface PlantDto {
  id:           string;
  name:         string;
  botanicName:  string;
  description:  string;
  imageUrl:     string;
  price:        number;
  level:        PlantLevel;
  levelLabel:   string;
  decoration:   string | null;
  isAvailable:  boolean;
  isSeasonal:   boolean;
  seasonStart:  string | null;
  seasonEnd:    string | null;
  createdAt:    string;
}

export interface UserPlantDto {
  id:                    string;
  userId:                string;
  plantId:               string;
  plantName:             string;
  plantImageUrl:         string;
  plantBotanicName:      string;
  coinsSpent:            number;
  purchaseDate:          string;
  currentStage:          GrowthStage;
  currentStageLabel:     string;
  stageCoinsAccumulated: number;
  coinsToNextStage:      number;
  growthHistories:       GrowthHistoryDto[];
}

export interface GardenSummaryDto {
  totalPlants:        number;
  totalCoinsInvested: number;
  firstPurchased:     UserPlantDto | null;
  mostExpensive:      UserPlantDto | null;
  plants:             UserPlantDto[] | null;
}

export interface GrowthHistoryDto {
  id:            string;
  userPlantId:   string;
  stage:         GrowthStage;
  stageLabel:    string;
  achievementId: string;
  growthDate:    string;
}

export interface PurchasePlantDto {
  plantId: string;
}
