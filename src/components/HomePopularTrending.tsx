import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TRENDING = [
    { id: '1', label: 'Balloon Decoration', rating: '4.8/5' },
    { id: '2', label: 'Serving Staff', rating: '4.6/5' },
    { id: '3', label: 'Cleaning Staff', rating: '4.4/5' },
];

const HomePopularTrending: React.FC = () => {
    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Popular & Trending</Text>
                <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {TRENDING.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardImage} />
                        <Text style={styles.cardLabel}>{item.label}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.star}>⭐</Text>
                            <Text style={styles.rating}>{item.rating}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },
    viewAll: {
        fontSize: 13,
        color: '#1C2340',
        fontWeight: '600',
    },
    row: {
        gap: 14,
        paddingRight: 20,
    },
    card: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 10,
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    star: {
        fontSize: 12,
    },
    rating: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default HomePopularTrending;