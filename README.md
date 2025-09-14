# GymApp - React Native Mobile Application

A comprehensive React Native mobile application for gym management, connected to a Laravel API backend.

## Features

- **Authentication**: Login and signup functionality
- **Home Dashboard**: Overview of gym services and user information
- **Memberships**: Browse and view membership plans
- **Classes**: View available classes and book sessions
- **Services**: Browse additional gym services
- **Profile**: View and edit user profile information

## Architecture

The application follows SOLID principles and clean architecture patterns:

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   └── forms/          # Form-specific components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Home screen
│   ├── memberships/    # Membership-related screens
│   ├── classes/        # Class-related screens
│   ├── services/       # Service-related screens
│   └── profile/        # Profile screen
├── services/           # API service layer
├── navigation/         # Navigation configuration
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom hooks
├── types/              # TypeScript type definitions
├── constants/          # App constants
└── utils/              # Utility functions
```

### Key Design Patterns

1. **Service Layer Pattern**: All API calls are handled through service classes
2. **Repository Pattern**: Data access is abstracted through service classes
3. **Context Pattern**: Authentication state is managed through React Context
4. **Component Composition**: Reusable UI components following single responsibility
5. **Navigation Pattern**: Stack and tab navigation for different app sections

## API Integration

The app connects to a Laravel API backend at `http://127.0.0.1:8000/api/v1` with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Memberships
- `GET /memberships` - List all memberships
- `GET /memberships/{id}` - Get membership details

### Classes
- `GET /classes` - List all classes
- `GET /classes/{id}` - Get class details

### Services
- `GET /services` - List all services
- `GET /services/{id}` - Get service details

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run the Application**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Dependencies

### Core Dependencies
- `react-native`: 0.73.11
- `react`: 18.2.0
- `typescript`: 5.0.4

### Navigation
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/stack`
- `react-native-screens`
- `react-native-safe-area-context`

### HTTP & Storage
- `axios`: HTTP client for API requests
- `@react-native-async-storage/async-storage`: Local storage

### UI Components
- `react-native-vector-icons`: Icon library

## Code Quality

The codebase follows these principles:

- **SOLID Principles**: Single responsibility, open/closed, etc.
- **DRY (Don't Repeat Yourself)**: Reusable components and services
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Proper loading indicators for better UX
- **Validation**: Form validation with user-friendly error messages

## Development Guidelines

1. **Components**: Create reusable components in `src/components/ui/`
2. **Services**: Add new API services in `src/services/`
3. **Screens**: Add new screens in appropriate folders under `src/screens/`
4. **Types**: Define TypeScript interfaces in `src/types/`
5. **Constants**: Add app constants in `src/constants/`

## Testing

Run tests with:
```bash
npm test
```

## Building for Production

### iOS
```bash
cd ios
xcodebuild -workspace GymApp.xcworkspace -scheme GymApp -configuration Release
```

### Android
```bash
cd android
./gradlew assembleRelease
```

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Follow SOLID principles
4. Add proper error handling
5. Include loading states
6. Write meaningful commit messages

## License

This project is licensed under the MIT License.