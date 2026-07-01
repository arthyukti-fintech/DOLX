import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import styles from './css/bookingCardStyles';


interface BookingCardProps {
    image: any;
    title: string;
    description: string;
    date: string;
    location: string;
    rating: string;
    status: 'Confirmed' | 'Pending' | 'Completed';
    onPress?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
    image,
    title,
    description,
    date,
    location,
    rating,
    status,
    onPress,
}) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'Confirmed':
                return styles.confirmedBadge;

            case 'Pending':
                return styles.pendingBadge;

            case 'Completed':
                return styles.completedBadge;

            default:
                return styles.pendingBadge;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={onPress}
        >
            {/* Image */}

            <Image
                source={image}
                style={styles.image}
            />

            {/* Right Section */}

            <View style={styles.content}>

                {/* Title */}

                <View style={styles.titleRow}>

                    <Text
                        numberOfLines={1}
                        style={styles.title}
                    >
                        {title}
                    </Text>

                    <View style={styles.ratingRow}>
                        <Text style={styles.star}>⭐</Text>

                        <Text style={styles.rating}>
                            {rating}
                        </Text>
                    </View>

                </View>

                {/* Description */}

                <Text
                    numberOfLines={2}
                    style={styles.description}
                >
                    {description}
                </Text>

                {/* Date */}

                <View style={styles.infoRow}>

                    <Image
                        source={require('../../assets/images/apple.png')}
                        style={styles.infoIcon}
                    />

                    <Text style={styles.infoText}>
                        {date}
                    </Text>

                </View>

                {/* Location */}

                <View style={styles.infoRow}>

                    <Image
                        source={require('../../assets/images/apple.png')}
                        style={styles.infoIcon}
                    />

                    <Text style={styles.infoText}>
                        {location}
                    </Text>

                </View>

                {/* Status */}

                <View style={getStatusStyle()}>

                    <Image
                        source={require('../../assets/images/apple.png')}
                        style={styles.statusIcon}
                    />

                    <Text style={styles.statusText}>
                        {status}
                    </Text>

                </View>

            </View>
        </TouchableOpacity>
    );
};

export default BookingCard;