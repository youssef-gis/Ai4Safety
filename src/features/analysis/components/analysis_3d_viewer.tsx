import CesiumWrapper from "@/components/3D_Viewer/CesiumWrapper";

async function getPosition() {
  //Mimic server-side stuff...
  return {
    position: {
      lat: 39.953436,
      lng: -75.164356
    }
  }
};

type AnalaysisProps= {
  tilesetUrl:string;
}

export const  Analysis3DViewer =  ({tilesetUrl}: AnalaysisProps) => {

  //const fetchedPosition = await getPosition();
  return (
      <CesiumWrapper tilesetUrl = {tilesetUrl} />

  )
}