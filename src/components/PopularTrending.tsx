import React from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';

import styles from './css/popularTrendingStyles';

const DATA = [
    {
        id: '1',
        title: 'Balloon Decoration',
        rating: '4.8/5',
        favourite: true,
        image: require('../../assets/images/image 1.png'),
    },
    {
        id: '2',
        title: 'Serving Staff',
        rating: '4.6/5',
        favourite: false,
        image: require('../../assets/images/image 2.png'),
    },
    {
        id: '3',
        title: 'Cleaning Staff',
        rating: '4.4/5',
        favourite: false,
        image: require('../../assets/images/Rectangle 18.png'),
    },
];

const PopularTrending = () => {
    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
        >
            <View>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="cover"
                />

                <TouchableOpacity style={styles.heartButton}>
                    <Text style={styles.heart}>
                        {item.favourite ? '❤' : '♡'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text
                numberOfLines={1}
                style={styles.title}
            >
                {item.title}
            </Text>

            <View style={styles.ratingRow}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.rating}>{item.rating}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Popular & Trending
                </Text>

                <TouchableOpacity>
                    <Text style={styles.viewAll}>
                        View All
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                horizontal
                data={DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 18 }} />
                )}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                }}
            />
        </View>
    );
};

export default PopularTrending;