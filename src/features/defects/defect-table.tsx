"use client"
import { DataTable } from "@/components/data-table"
import { getColumns, Defect } from "./columns"
import { getDefects } from "./queries/get-defects";

// async function getData(): Promise<Defect[]> {
//   // Fetch data from your API here.
//   return [
//     {
//       id:'1',
//       type: "SPALLING_CRACK",
//       status: "NEW",
//       severity: "LOW",
//     },
//     {
//       id:'2',
//       type: "EFFLORESCENCE",
//       status: "IN_PROGRESS",
//       severity: "CRITICAL",
//     },
//     {
//       id:'3',
//       type: "WATER_DAMAGE",
//       status: "RESOLVED",
//       severity: "CRITICAL",
//     },    
//     {
//       id:'4',
//       type: "SPALLING_CRACK",
//       status: "NEW",
//       severity: "LOW",
//     },
//     {
//       id:'5',
//       type: "EFFLORESCENCE",
//       status: "IN_PROGRESS",
//       severity: "CRITICAL",
//     },
//     {
//       id:'6',
//       type: "WATER_DAMAGE",
//       status: "RESOLVED",
//       severity: "CRITICAL",
//     },    
//     {
//       id:'7',
//       type: "SPALLING_CRACK",
//       status: "NEW",
//       severity: "LOW",
//     },
//     {
//       id:'8',
//       type: "EFFLORESCENCE",
//       status: "IN_PROGRESS",
//       severity: "CRITICAL",
//     },
//     {
//       id:'9',
//       type: "WATER_DAMAGE",
//       status: "RESOLVED",
//       severity: "CRITICAL",
//     },    
//     {
//       id:'10',
//       type: "SPALLING_CRACK",
//       status: "NEW",
//       severity: "LOW",
//     },
//     {
//       id:'11',
//       type: "EFFLORESCENCE",
//       status: "IN_PROGRESS",
//       severity: "CRITICAL",
//     },
//     {
//       id:'12',
//       type: "WATER_DAMAGE",
//       status: "RESOLVED",
//       severity: "CRITICAL",
//     }
//     // ...
//   ]
// };

type DefectTableProps = {
  //inspectionId: string;
  data: Defect[]; // Data is now passed from parent
  onViewDefect: (id: string) => void;
};

export default  function DefectTable({ data, onViewDefect }: DefectTableProps) {
  //const data = await getData();
  const defects  =  getColumns(onViewDefect);
  if (!defects)return;
  console.log(defects)

  return (
   
      <DataTable columns={defects} data={data} />

  )
}