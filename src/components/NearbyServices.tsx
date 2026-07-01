import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import styles from './css/nearbyServicesStyles';
import { router } from 'expo-router';

const Images = {
    service1: require('../../assets/images/Rectangle 18.png'),
    service2: require('../../assets/images/Rectangle 18.png'),
    service3: require('../../assets/images/Rectangle 18.png'),
};

const services = [
    {
        id: '1',
        title: 'Event Helper',
        description: 'Lorem ipsum is placeholder text commonly',
        location: 'Basaveshwaranagar',
        rating: '4.8',
        image: Images.service1,
    },
    {
        id: '2',
        title: 'Setup Crew',
        description: 'Lorem ipsum is placeholder text commonly',
        location: 'Vijayanagar',
        rating: '4.7',
        image: Images.service2,
    },
    {
        id: '3',
        title: 'Decoration',
        description: 'Lorem ipsum is placeholder text commonly',
        location: 'Rajajinagar',
        rating: '4.9',
        image: Images.service3,
    },
];

const CARD_WIDTH = 290;

const NearbyServices = () => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < services.length - 1) {
            const nextIndex = currentIndex + 1;

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });

            setCurrentIndex(nextIndex);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;

            flatListRef.current?.scrollToIndex({
                index: prevIndex,
                animated: true,
            });

            setCurrentIndex(prevIndex);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <View style={styles.card}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>
                            {item.title}
                        </Text>

                        <View style={styles.ratingRow}>
                            <Text style={styles.star}>⭐</Text>
                            <Text style={styles.rating}>
                                {item.rating}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.description}>
                        {item.description}
                    </Text>

                    <View style={styles.locationRow}>
                        <Text style={styles.locationIcon}>
                            📍
                        </Text>

                        <Text style={styles.location}>
                            {item.location}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => { router.push("/eventPlannerScreen") }}>
                        <Text style={styles.buttonText}>
                            View More Details
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Nearby Services
                </Text>

                <View style={styles.arrowContainer}>
                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={handlePrevious}
                    >
                        <Text style={styles.arrow}>
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={handleNext}
                    >
                        <Text style={styles.arrow}>
                            ›
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Slider */}
            <FlatList
                ref={flatListRef}
                horizontal
                data={services}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                }}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 16 }} />
                )}
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + 16,
                    offset: (CARD_WIDTH + 16) * index,
                    index,
                })}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                        event.nativeEvent.contentOffset.x /
                        (CARD_WIDTH + 16)
                    );

                    setCurrentIndex(index);
                }}
            />
        </View>
    );
};

export default NearbyServices;