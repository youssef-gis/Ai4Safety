/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Detection } from '@prisma/client';


const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#334155' },
  
  // -- Header Section --
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 20 },
  brandSection: { flexDirection: 'column' },
  metaSection: { flexDirection: 'column', alignItems: 'flex-end' },
  brandTitle: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  projectTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  metaText: { fontSize: 9, color: '#64748b', marginBottom: 2 },

  // -- Executive Summary --
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  statBox: { flex: 1, padding: 15, borderRadius: 6, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: 9, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  
  // -- Breakdown --
  breakdownContainer: { marginBottom: 30, padding: 15, backgroundColor: '#f8fafc', borderRadius: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  breakdownLabel: { fontSize: 10, color: '#334155' },
  breakdownValue: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },

  // -- Detailed Log --
  defectCard: { marginBottom: 15, borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#f1f5f9' },
  cardTitle: { fontSize: 11, fontWeight: 'bold', color: '#334155' },
  cardBody: { padding: 10, flexDirection: 'row' },
  dataColumn: { width: '40%', paddingRight: 10 },
  imageColumn: { width: '60%', height: 120, backgroundColor: '#f8fafc', borderRadius: 4, alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' },
  
  // -- Fields --
  fieldRow: { marginBottom: 8 },
  fieldLabel: { fontSize: 8, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' },
  fieldValue: { fontSize: 10, color: '#0f172a' },

  // -- Badges --
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontSize: 8, fontWeight: 'bold' },
  // Status Colors
  statusResolved: { backgroundColor: '#dcfce7', color: '#166534' },
  statusOpen: { backgroundColor: '#fee2e2', color: '#991b1b' },
  // Severity Colors
  severityCritical: { color: '#ef4444' },
  severityHigh: { color: '#f97316' },
  severityMedium: { color: '#eab308' },
  severityLow: { color: '#64748b' },
});

interface InspectionPDFProps {
  inspectionId: string;
  defects: Detection[];
  projectName?: string;
}

export const InspectionPDFTemplate = ({ inspectionId, defects, projectName }: InspectionPDFProps) => {
  if (defects.length === 0) return null;

  // --- Calculations ---
  const totalDefects = defects.length;
  const resolvedCount = defects.filter(d => d.status === 'RESOLVED').length;
  const pendingCount = totalDefects - resolvedCount;
  const criticalCount = defects.filter(d => d.severity === 'CRITICAL').length;

  // Group by Type
  const typeCounts = defects.reduce((acc, defect) => {
    const type = defect.type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Helper for Severity Color
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return styles.severityCritical;
      case 'HIGH': return styles.severityHigh;
      case 'MEDIUM': return styles.severityMedium;
      default: return styles.severityLow;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* --- 1. HEADER --- */}
        <View style={styles.headerContainer}>
            <View style={styles.brandSection}>
                <Text style={styles.brandTitle}>INSPECTION REPORT</Text>
                <Text style={styles.projectTitle}>{projectName || 'Project Report'}</Text>
            </View>
            <View style={styles.metaSection}>
                <Text style={styles.metaText}>Date: {new Date().toLocaleDateString()}</Text>
                <Text style={styles.metaText}>Ref: #{inspectionId.split('-').pop()}</Text>
            </View>
        </View>

        {/* --- 2. EXECUTIVE SUMMARY --- */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.statsContainer}>
            {/* Box 1: Total */}
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Findings</Text>
                <Text style={styles.statNumber}>{totalDefects}</Text>
            </View>
            {/* Box 2: Critical */}
            <View style={[styles.statBox, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
                <Text style={[styles.statLabel, { color: '#ef4444' }]}>Critical Risks</Text>
                <Text style={[styles.statNumber, { color: '#ef4444' }]}>{criticalCount}</Text>
            </View>
            {/* Box 3: Pending Actions (Better than "Resolved") */}
            <View style={[styles.statBox, { backgroundColor: pendingCount > 0 ? '#fff7ed' : '#f0fdf4' }]}>
                <Text style={styles.statLabel}>Action Items Pending</Text>
                <Text style={[styles.statNumber, { color: pendingCount > 0 ? '#ea580c' : '#166534' }]}>
                    {pendingCount}
                </Text>
            </View>
        </View>

        {/* --- 3. BREAKDOWN --- */}
        <Text style={styles.sectionTitle}>Defect Breakdown</Text>
        <View style={styles.breakdownContainer}>
            {Object.entries(typeCounts).map(([type, count]) => (
                <View key={type} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{type.replace('_', ' ')}</Text>
                    <Text style={styles.breakdownValue}>{count}</Text>
                </View>
            ))}
        </View>

        {/* --- 4. DETAILED LOG --- */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Detailed Inspection Log</Text>
        {defects.map((defect, index) => (
          <View key={defect.id} style={styles.defectCard} wrap={false}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>#{index + 1} - {defect.type?.replace('_', ' ')}</Text>
                <Text style={[styles.cardTitle, getSeverityStyle(defect.severity || 'LOW')]}>
                    {defect.severity}
                </Text>
            </View>
            
            <View style={styles.cardBody}>
                <View style={styles.dataColumn}>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <View style={[
                            styles.badge, 
                            defect.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
                        ]}>
                            <Text style={{ fontSize: 8 }}>{defect.status}</Text>
                        </View>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Measurements</Text>
                        <Text style={styles.fieldValue}>
                            {(defect as any).locationOn3dModel?.measurement || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Notes</Text>
                        <Text style={styles.fieldValue}>{defect.notes || 'No notes provided.'}</Text>
                    </View>
                </View>
                <View style={styles.imageColumn}>
                    <Text style={{ color: '#cbd5e1', fontSize: 10 }}>[ Site Photo Placeholder ]</Text>
                </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};