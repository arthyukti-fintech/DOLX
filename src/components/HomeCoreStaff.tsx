import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const STAFF = [
    { id: '1', label: 'Event Helper' },
    { id: '2', label: 'Setup Crew' },
    { id: '3', label: 'Decoration' },
    { id: '4', label: 'Catering Staff' },
    { id: '5', label: 'Cleaning Staff' },
    { id: '6', label: 'Promoter' },
    { id: '7', label: 'Hostess' },
    { id: '8', label: 'Security' },
];

const HomeCoreStaff: React.FC = () => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Core Staff</Text>
            <View style={styles.grid}>
                {STAFF.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.staffItem} activeOpacity={0.7}>
                        <View style={styles.staffCard} />
                        <Text style={styles.staffLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    staffItem: {
        width: '30%',
        alignItems: 'center',
    },
    staffCard: {
        width: 100,
        // aspectRatio: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        marginBottom: 8,
        height:70
    },
    staffLabel: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default HomeCoreStaff;