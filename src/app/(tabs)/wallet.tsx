import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
    id: string;
    title: string;
    date: string;
    location: string;
    type: 'credit' | 'debit';
    amount: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
    { id: '1', title: 'Cleaning Staff', date: 'March 25, 8:26 AM', location: 'Yeshwanthpur', type: 'debit', amount: '84,756' },
    { id: '2', title: 'Refund – Wedding Event', date: 'March 25, 3:50 PM', location: 'Koramangala', type: 'credit', amount: '21,800' },
    { id: '3', title: 'Product Launch Night', date: 'March 25, 8:26 AM', location: 'Yeshwanthpur', type: 'debit', amount: '9,654' },
    { id: '4', title: 'Music Festival Prep', date: 'March 25, 8:26 AM', location: 'March 25', type: 'debit', amount: '24,128' },
    { id: '5', title: 'Serving Staff', date: 'March 25, 3:50 PM', location: 'Koramangala', type: 'credit', amount: '25,950' },
    { id: '6', title: 'Product Launch Night', date: 'March 25, 8:26 AM', location: 'Yeshwanthpur', type: 'debit', amount: '9,654' },
    { id: '7', title: 'Product Launch Night', date: 'March 25, 8:26 AM', location: 'Yeshwanthpur', type: 'debit', amount: '9,654' },
    { id: '8', title: 'Product Launch Night', date: 'March 25, 8:26 AM', location: 'Yeshwanthpur', type: 'debit', amount: '9,654' },
];

// ─── TransactionCard ──────────────────────────────────────────────────────────

interface TransactionCardProps {
    title: string;
    amount: string;
    date: string;
    location: string;
    type: 'credit' | 'debit';
    onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
    title,
    amount,
    date,
    location,
    type,
    onPress,
}) => {
    const isCredit = type === 'credit';
    const accentColor = isCredit ? '#35B74B' : '#F44336';
    const iconBg = isCredit ? '#DFF4E2' : '#FCE2E2';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={cardStyles.card}
            onPress={onPress}
        >
            <View style={[cardStyles.iconContainer, { backgroundColor: iconBg }]}>
                <Text style={[cardStyles.arrow, { color: accentColor }]}>
                    {isCredit ? '↓' : '↑'}
                </Text>
            </View>

            <View style={cardStyles.content}>
                <Text style={cardStyles.title} numberOfLines={1}>
                    {title}
                </Text>
                <View style={cardStyles.metaRow}>
                    <Text style={cardStyles.metaIcon}>🕐</Text>
                    <Text style={cardStyles.metaText}>{date}</Text>
                    <Text style={[cardStyles.metaIcon, { marginLeft: 8 }]}>📍</Text>
                    <Text style={cardStyles.metaText} numberOfLines={1}>
                        {location}
                    </Text>
                </View>
            </View>

            <Text style={[cardStyles.amount, { color: accentColor }]}>
                {isCredit ? '+' : '-'}₹{amount}
            </Text>
        </TouchableOpacity>
    );
};

const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    arrow: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    metaIcon: {
        fontSize: 10,
        marginRight: 3,
        color: '#888888',
    },
    metaText: {
        fontSize: 10,
        color: '#666666',
        marginRight: 4,
        flexShrink: 1,
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
        flexShrink: 0,
    },
});

// ─── Header ───────────────────────────────────────────────────────────────────

const WalletHeader: React.FC = () => (
    <View style={headerStyles.container}>
        <Text style={headerStyles.heading}>My Wallet</Text>
        <View style={headerStyles.totalCard}>
            <Text style={headerStyles.totalLabel}>Total Spent</Text>
            <Text style={headerStyles.totalAmount}>₹52,456</Text>
        </View>
    </View>
);

const headerStyles = StyleSheet.create({
    container: {
        backgroundColor: '#1B2547',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 28,
        paddingBottom: 32,
        paddingHorizontal: 20,
        height: 200
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
    },
    totalCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    totalLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginBottom: 6,
    },
    totalAmount: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MyWalletScreen: React.FC = () => {
    const handleTransactionPress = (tx: Transaction) => {
        console.log('Pressed transaction:', tx.id);
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Fixed header — stays in place while list scrolls */}
            <WalletHeader />

            {/* Scrollable transactions only */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transactions</Text>

                <FlatList
                    data={TRANSACTIONS}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TransactionCard
                            title={item.title}
                            date={item.date}
                            location={item.location}
                            type={item.type}
                            amount={item.amount}
                            onPress={() => handleTransactionPress(item)}
                        />
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

export default MyWalletScreen;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    section: {
        flex: 1,           // fills remaining space below the fixed header
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 32,
    },
});