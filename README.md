# Wedding RSVP Application

A modern wedding RSVP management system built with Next.js, featuring a beautiful dashboard for managing guest responses and dietary restrictions.

## Tech Stack 
- **Frontend**: Next.js 15, Tailwind CSS
- **Database**: MongoDB
- **Testing**: Cypress E2E tests
- **Deployment**: Docker, NGINX
- **Design**: Figma, Illustrator

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Environment Setup
1. Copy the environment template:
   ```bash
   cp wedding-rsvp/.env.example wedding-rsvp/.env.local
   ```

2. Update the MongoDB URI in `wedding-rsvp/.env.local`:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```

3. Install dependencies:
   ```bash
   cd wedding-rsvp
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Testing
Run the Cypress E2E tests:
```bash
npm run cypress:run
```

## GitHub Actions

The project includes automated testing via GitHub Actions:
- E2E tests run on pull requests
- Visual regression testing
- Automatic test summaries

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed setup instructions.
