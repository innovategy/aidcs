# AI-Powered Data Cleansing System

A Next.js-based web application for validating and cleansing employee data using AI-powered analysis. The system provides real-time validation, duplicate detection, and data standardization capabilities while maintaining data privacy and security.

## Features

- 📤 Drag-and-drop file upload interface
- 🤖 AI-powered data validation and cleansing
- 🔍 Fuzzy duplicate detection with configurable thresholds
- 📊 Interactive data grid with inline editing
- 📝 Change tracking and history
- 📑 Standardized Excel export
- 🔒 No permanent data storage (in-memory processing)
- ⚡ Real-time validation and feedback
- 🎯 Configurable validation rules and thresholds

## Technical Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **AI Integration**: Anthropic API
- **File Processing**: SheetJS
- **State Management**: React Context
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Development Tools**: ESLint (Airbnb config)

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-data-cleansing.git
cd ai-data-cleansing
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## System Architecture

The application follows a modular architecture with clear separation of concerns:

### Core Components

- `DataContext`: Manages the application's data state
- `ConfigContext`: Handles validation and processing configurations
- `FileUpload`: Handles file upload and initial processing
- `DataGrid`: Interactive data display and editing interface
- `ValidationIndicator`: Visual feedback for validation status

### Services

- `anthropicService`: Handles AI-powered validation
- `excelProcessor`: Processes Excel file uploads
- `employeeValidator`: Implements validation rules

### Hooks

- `useAIValidation`: Manages AI validation process
- `useDuplicateDetection`: Handles duplicate record detection
- `useValidation`: Implements client-side validation rules
- `useFileUpload`: Manages file upload process

## Data Model

The system processes employee records with the following structure:

```typescript
interface EmployeeRecord {
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    // ... (see types/employee/EmployeeRecord.ts for full structure)
}
```

## Validation Rules

The system implements various validation rules:

- Required field validation
- Email format validation
- Phone number format standardization
- Date format validation
- Business logic validation (e.g., FT/PT status vs. hours)
- Salary calculations
- Address standardization
- Duplicate detection

## Configuration

Validation and processing settings can be adjusted through the UI or by modifying:

- `src/constants/validation.ts`: Validation thresholds and rules
- `src/constants/duplication.ts`: Duplicate detection settings

## Development Guidelines

1. **Code Style**
    - Follow Airbnb ESLint configuration
    - Use TypeScript strict mode
    - Implement proper error handling
    - Document complex logic
    - Use meaningful variable names

2. **Git Workflow**
    - Feature branches
    - Pull request reviews
    - Conventional commits
    - Version tagging

3. **Testing**
    - Unit tests for validation rules
    - Integration tests for file processing
    - UI component testing
    - End-to-end validation flows

## Security Considerations

- No permanent storage of sensitive data
- All processing done in-memory
- Secure API key handling
- Input sanitization
- Rate limiting implementation
- File type validation

## Performance Optimization

- Chunked data processing
- Progressive loading
- Debounced validations
- Memory management
- Caching strategies

## Error Handling

The system implements comprehensive error handling:

- Validation errors with clear messages
- Processing failures with recovery options
- API error handling with retries
- User-friendly error notifications

## Deployment

The application can be deployed using Vercel:

```bash
npm run build
vercel deploy
```

Environment variables must be configured in the deployment platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Anthropic for providing the AI capabilities
- SheetJS for Excel file processing
- shadcn/ui for UI components
- The Next.js team for the amazing framework
