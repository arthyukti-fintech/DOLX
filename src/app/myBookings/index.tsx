import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
} from 'react-native';

import HomeHeader from '@/components/HomeHeader';
import HomeSearch from '@/components/HomeSearch';
import BookingCard from '@/components/BookingCard';
import AppBackButton from '@/components/comman/AppHeader';

import styles from './myBookingsStyles';

const bookings = [
    {
        id: '1',
        image: require('../../../assets/images/Rectangle 18.png'),
        title: 'Event Helper',
        description: 'Lorem ipsum is placeholder text',
        date: 'June 23, 3:50 PM',
        location: 'Mahadevapura',
        rating: '5.0',
        status: 'Confirmed' as const,
    },
    {
        id: '2',
        image: require('../../../assets/images/Rectangle 18.png'),
        title: 'Balloon Decoration',
        description: 'Lorem ipsum is placeholder text commonly used.',
        date: 'June 24, 11:00 AM',
        location: 'Whitefield',
        rating: '4.8',
        status: 'Pending' as const,
    },
    {
        id: '3',
        image: require('../../../assets/images/Rectangle 18.png'),
        title: 'Cleaning Staff',
        description: 'Lorem ipsum is placeholder text commonly used.',
        date: 'June 25, 6:30 PM',
        location: 'Rajajinagar',
        rating: '4.9',
        status: 'Completed' as const,
    },
    {
        id: '4',
        image: require('../../../assets/images/Rectangle 18.png'),
        title: 'Setup Crew',
        description: 'Lorem ipsum is placeholder text commonly used.',
        date: 'June 26, 10:30 AM',
        location: 'Indiranagar',
        rating: '4.7',
        status: 'Confirmed' as const,
    },
];

export default function MyBookings() {
    return (
        <View style={styles.container}>

            {/* Fixed Header */}
            <View style={styles.darkSection}>
                <AppBackButton style={{ marginTop: 0, marginLeft: -17 }} />
                <HomeHeader />
                <HomeSearch />
            </View>

            {/* Fixed Heading */}
            <View style={styles.headingContainer}>
                <Text style={styles.heading}>My Bookings</Text>

                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Bookings */}
            <FlatList
                style={styles.list}
                data={bookings}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <BookingCard
                        image={item.image}
                        title={item.title}
                        description={item.description}
                        date={item.date}
                        location={item.location}
                        rating={item.rating}
                        status={item.status}
                        onPress={() => console.log(item.title)}
                    />
                )}
            />

        </View>
    );
}