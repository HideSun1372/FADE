export type Directions = "NORTH" | "SOUTH" | "WEST" | "EAST";

export interface GameState{
    roomID: number;
    hasKey: boolean;
    description: string;
    progressDirection: string;
    lastDir: Directions;
}