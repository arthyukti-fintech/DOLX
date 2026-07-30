import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const HomeSearch: React.FC = () => {
    const [query, setQuery] = useState('');

    return (
        <View style={styles.wrapper}>
            <View style={styles.searchRow}>
                <View style={styles.searchIcon}>
                    {/* search icon placeholder */}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Find your perfect event"
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 4,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A3255',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 46,
    },
    searchIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
    },
});

export default HomeSearch;