/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Detection } from '@prisma/client';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  
  // -- Typography --
  h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#0f172a' },
  h2: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 10, color: '#334155', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5 },
  label: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 10, color: '#0f172a', fontWeight: 'medium' },
  
  // -- Components --
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '30%', padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  
  // -- Defect Card (The Detail View) --
  defectCard: { 
    marginBottom: 20, 
    border: '1px solid #e2e8f0', 
    borderRadius: 6, 
    padding: 10,
    backgroundColor: '#fff'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 5 },
  cardBody: { flexDirection: 'row' },
  cardData: { width: '40%', paddingRight: 10 },
  cardImage: { width: '60%', height: 120, backgroundColor: '#f1f5f9', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  
  // -- Badge --
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8, color: 'white' },
  badgeCritical: { backgroundColor: '#ef4444' },
  badgeHigh: { backgroundColor: '#f97316' },
  badgeLow: { backgroundColor: '#64748b' },
});

interface InspectionPDFProps {
  inspectionId: string;
  defects: Detection[];
  projectName?: string;
}

export const InspectionPDFTemplate = ({ inspectionId, defects, projectName }: InspectionPDFProps) => {
  if (defects.length === 0){
    return null;
  }
  // 1. Calculate General Stats
  const totalDefects = defects.length;
  const criticalCount = defects.filter(d => d.severity === 'CRITICAL').length;
  const resolvedCount = defects.filter(d => d.status === 'RESOLVED').length;

  // 1. Calculate counts dynamically
  const typeCounts = defects.reduce((acc, defect) => {
    const type = defect.type || '' //.replace('_', ' '); // Clean up "SPALLING_CRACK" -> "SPALLING CRACK"
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Document>
      {/* --- PAGE 1: THE GENERAL VIEW --- */}
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>INSPECTION REPORT</Text>
            <Text style={styles.h1}>{projectName || 'Untitled Project'}</Text>
            <Text style={styles.value}>ID: {inspectionId}</Text>
            <Text style={styles.value}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <Text style={styles.h2}>1. Executive Summary</Text>
        <View style={styles.statsContainer}>
            <View style={styles.statBox}>
                <Text style={styles.label}>Total Defects</Text>
                <Text style={styles.statNumber}>{totalDefects}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
                <Text style={styles.label}>Critical Risks</Text>
                <Text style={[styles.statNumber, { color: '#ef4444' }]}>{criticalCount}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.label}>Resolved</Text>
                <Text style={[styles.statNumber, { color: '#22c55e' }]}>{resolvedCount}</Text>
            </View>
        </View>

        {/* Breakdown by Type Table */}
        <Text style={styles.h2}>2. Defect Breakdown</Text>
        <View style={{ marginTop: 10 }}>
            {Object.entries(typeCounts).map(([type, count]) => (
                <Text key={type} style={styles.label}>
                    • {type.replace('_', ' ')}: {count}
                </Text>
            ))}
        </View>
      </Page>

      {/* --- PAGE 2+: THE DETAIL OVERVIEW --- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>3. Detailed Inspection Log</Text>

        {defects.map((defect, index) => (
         
          // wrap={false} ensures a card doesn't get split across pages
          <View key={defect.id} style={styles.defectCard} wrap={false}>
            
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Defect #{index + 1}</Text>
                <View style={[
                    styles.badge, 
                    defect.severity === 'CRITICAL' ? styles.badgeCritical : 
                    defect.severity === 'HIGH' ? styles.badgeHigh : styles.badgeLow
                ]}>
                    <Text>{defect.severity}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {/* Left Side: Data & Measurement */}
                <View style={styles.cardData}>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Type</Text>
                        <Text style={styles.value}>{defect!.type.replace('_', ' ')}</Text>
                    </View>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>{defect.status}</Text>
                    </View>
                    {/* Shows measurement if available (e.g., from 3D drawing) */}
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Measurements</Text>
                        {/* Assuming your detection object has a measurement field */}
                         <Text style={styles.value}>
                            {(defect as any).locationOn3dModel?.measurement || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Right Side: Capture of Defect Location */}
                <View style={styles.cardImage}>
                    {/* MVP NOTE: If you have a 'thumbnailUrl' or 'screenshotUrl' stored 
                       in your DB, put it here. Otherwise, use a placeholder.
                    */}
                    {/* <Image src={defect.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
                    <Text style={{ color: '#cbd5e1', fontSize: 10 }}>[ Defect Capture Image ]</Text>
                </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};