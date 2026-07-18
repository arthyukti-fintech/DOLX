import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    marginTop: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 18,
  },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20202A',
  },

  arrowContainer: {
    flexDirection: 'row',
  },

  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#FFF',
  },

  arrow: {
    fontSize: 18,
    color: '#7B7B7B',
  },

  card: {
    width: 300,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 18,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginRight: 16,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F1F1F',
  },

  role: {
    fontSize: 15,
    color: '#5D5D5D',
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  star: {
    fontSize: 16,
    marginRight: 5,
  },

  rating: {
    fontSize: 15,
    color: '#333',
  },

  buttonRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginTop: 22,
    gap: 10
  },

  bookButton: {
    backgroundColor: '#10195C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  bookText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },

  profileButton: {
    borderWidth: 1,
    borderColor: '#10195C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  profileText: {
    color: '#10195C',
    fontWeight: '600',
    fontSize: 14,
  },
});