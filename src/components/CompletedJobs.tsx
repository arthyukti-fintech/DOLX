import React from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import styles from './css/completedJobsStyles';

const jobs = [
    {
        id: '1',
        title: 'Security Service',
        description: 'Lorem ipsum is placeholder text',
        date: 'March 26, 3:50 PM',
        location: 'Koramangala',
        rating: '4.9',
        status: 'Completed',
        image:
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
    },
    {
        id: '2',
        title: 'Event Coordinator',
        description: 'Lorem ipsum is placeholder text',
        date: 'March 28, 5:00 PM',
        location: 'Indiranagar',
        rating: '4.8',
        status: 'Completed',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    },
];

const JobCard = ({ item }: any) => {
    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.title}</Text>

                    <View style={styles.ratingRow}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{item.rating}</Text>
                    </View>
                </View>

                <Text style={styles.description}>
                    {item.description}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.info}>🕒 {item.date}</Text>
                    <Text style={styles.info}>📍 {item.location}</Text>
                </View>

                <View style={styles.statusContainer}>
                    <Text style={styles.check}>✓</Text>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function CompletedJobs() {
    return (
        <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <JobCard item={item} />}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        />
    );
}