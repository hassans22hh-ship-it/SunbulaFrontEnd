export interface PlantDto {
  id:           string;
  name:         string;
  description:  string;
  basePrice:    number;
  plantLevel:   number; // enum PlantLevel (Seed=0, Sprout=1, BabyPlant=2, AdultPlant=3, Blooming=4)
  growthStage:  number; // enum GrowthStage (Seedling=0, Vegetative=1, Budding=2, Flowering=3, Mature=4)
  imageUrl?:    string;
}

export interface UserPlantDto {
  id:           string;
  userId:       string;
  plantId:      string;
  purchaseDate: string;
  isPlanted:    boolean;
  plantedDate?: string;
  totalWatered: number;
  
  // Navigation properties flattened for UI
  plantName:    string;
  description:  string;
  plantLevel:   number;
  growthStage:  number;
  imageUrl?:    string;
}

export interface PurchasePlantDto {
  plantId: string;
}
