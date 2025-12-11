export type MapLayer = {
  id: string;
  name: string;
  type: '3D_TILES' | 'IMAGERY' | 'POINT_CLOUD';
  url: string;
  visible: boolean;
  opacity?: number; // Useful for orthophotos
  isBaseLayer?: boolean; // To know which one to "Zoom To"
};