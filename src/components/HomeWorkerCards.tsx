import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native';

import styles from './css/featuredWorkersStyles';

const workers = [
    {
        id: '1',
        name: 'Kobi Potts',
        role: 'Cleaning Staff',
        rating: '4.9/5',
        image: require('../../assets/images/Rectangle 18.png'),
    },
    {
        id: '2',
        name: 'Kobi Potts',
        role: 'Cleaning Staff',
        rating: '4.9/5',
        image: require('../../assets/images/Rectangle 18.png'),
    },
    {
        id: '3',
        name: 'Kobi Potts',
        role: 'Cleaning Staff',
        rating: '4.9/5',
        image: require('../../assets/images/Rectangle 18.png'),
    },
];

const CARD_WIDTH = 270;

const FeaturedWorkers = () => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        if (currentIndex < workers.length - 1) {
            const index = currentIndex + 1;
            flatListRef.current?.scrollToIndex({
                index,
                animated: true,
            });
            setCurrentIndex(index);
        }
    };

    const previous = () => {
        if (currentIndex > 0) {
            const index = currentIndex - 1;
            flatListRef.current?.scrollToIndex({
                index,
                animated: true,
            });
            setCurrentIndex(index);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <Image source={item.image} style={styles.avatar} />

                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>

                    <Text style={styles.role}>{item.role}</Text>

                    <View style={styles.ratingRow}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{item.rating}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookText}>Book Now</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileButton}>
                    <Text style={styles.profileText}>View Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Featured Workers/Services
                </Text>

                <View style={styles.arrowContainer}>
                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={previous}
                    >
                        <Text style={styles.arrow}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={next}
                    >
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                horizontal
                data={workers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 18 }} />
                )}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                snapToInterval={CARD_WIDTH + 18}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + 18,
                    offset: (CARD_WIDTH + 18) * index,
                    index,
                })}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(
                        e.nativeEvent.contentOffset.x /
                        (CARD_WIDTH + 18)
                    );
                    setCurrentIndex(index);
                }}
            />
        </View>
    );
};

export default FeaturedWorkers;