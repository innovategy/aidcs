#!/bin/bash

# Create main app directories
mkdir -p src/{app,components,hooks,utils,types,services,context,constants}
mkdir -p src/components/{ui,layout,forms,data-grid}
mkdir -p src/services/{ai,validation,file}
mkdir -p src/types/{employee,validation}

# Create app files
cat > src/app/layout.tsx << EOL
// /src/app/layout.tsx
// Root layout component with providers and global styles
EOL

cat > src/app/page.tsx << EOL
// /src/app/page.tsx
// Main page component with file upload and data grid
EOL

# Create component files
cat > src/components/layout/Header.tsx << EOL
// /src/components/layout/Header.tsx
// Application header with navigation and controls
EOL

cat > src/components/forms/FileUpload.tsx << EOL
// /src/components/forms/FileUpload.tsx
// Drag and drop file upload component
EOL

cat > src/components/data-grid/DataGrid.tsx << EOL
// /src/components/data-grid/DataGrid.tsx
// Interactive data grid for displaying and editing employee records
EOL

cat > src/components/data-grid/DuplicateDetector.tsx << EOL
// /src/components/data-grid/DuplicateDetector.tsx
// Component for handling duplicate record detection and merging
EOL

cat > src/components/ui/ValidationIndicator.tsx << EOL
// /src/components/ui/ValidationIndicator.tsx
// Visual indicators for data validation status
EOL

# Create context files
cat > src/context/DataContext.tsx << EOL
// /src/context/DataContext.tsx
// Context for managing global application state
EOL

cat > src/context/ConfigContext.tsx << EOL
// /src/context/ConfigContext.tsx
// Context for managing validation and processing configurations
EOL

# Create service files
cat > src/services/ai/anthropicService.ts << EOL
// /src/services/ai/anthropicService.ts
// Service for interacting with Anthropic API
EOL

cat > src/services/validation/employeeValidator.ts << EOL
// /src/services/validation/employeeValidator.ts
// Employee data validation service
EOL

cat > src/services/file/excelProcessor.ts << EOL
// /src/services/file/excelProcessor.ts
// Service for processing Excel files using SheetJS
EOL

# Create type definition files
cat > src/types/employee/EmployeeRecord.ts << EOL
// /src/types/employee/EmployeeRecord.ts
// Type definitions for employee records
EOL

cat > src/types/validation/ValidationTypes.ts << EOL
// /src/types/validation/ValidationTypes.ts
// Type definitions for validation rules and results
EOL

# Create utility files
cat > src/utils/formatters.ts << EOL
// /src/utils/formatters.ts
// Utility functions for data formatting
EOL

cat > src/utils/validators.ts << EOL
// /src/utils/validators.ts
// Common validation utility functions
EOL

# Create hook files
cat > src/hooks/useFileUpload.ts << EOL
// /src/hooks/useFileUpload.ts
// Custom hook for handling file uploads
EOL

cat > src/hooks/useValidation.ts << EOL
// /src/hooks/useValidation.ts
// Custom hook for data validation
EOL

cat > src/hooks/useDuplicateDetection.ts << EOL
// /src/hooks/useDuplicateDetection.ts
// Custom hook for handling duplicate detection
EOL

# Create API route files
mkdir -p src/app/api
cat > src/app/api/process-files/route.ts << EOL
// /src/app/api/process-files/route.ts
// API route for handling file processing
EOL

cat > src/app/api/download/route.ts << EOL
// /src/app/api/download/route.ts
// API route for Excel file download
EOL

# Create constant files
cat > src/constants/validation.ts << EOL
// /src/constants/validation.ts
// Validation rules and thresholds
EOL

cat > src/constants/duplication.ts << EOL
// /src/constants/duplication.ts
// Duplicate detection configuration
EOL

echo "Project structure created successfully!"
