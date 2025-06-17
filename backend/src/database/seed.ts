import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { UserRole, TicketStatus, TicketPriority, ArticleStatus, ArticleVisibility } from '../types';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data
    db.exec(`
      DELETE FROM ticket_comments;
      DELETE FROM ticket_tags;
      DELETE FROM tickets;
      DELETE FROM article_tags;
      DELETE FROM articles;
      DELETE FROM categories;
      DELETE FROM chat_messages;
      DELETE FROM chat_sessions;
      DELETE FROM file_attachments;
      DELETE FROM users;
    `);

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@deskpro.com', 'Admin', 'User', adminPassword, UserRole.ADMIN, 1);

    // Create agent users
    const agent1Id = uuidv4();
    const agent1Password = await bcrypt.hash('agent123', 12);
    
    db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(agent1Id, 'agent@deskpro.com', 'Jane', 'Agent', agent1Password, UserRole.AGENT, 1);

    const agent2Id = uuidv4();
    const agent2Password = await bcrypt.hash('agent123', 12);
    
    db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(agent2Id, 'mike@deskpro.com', 'Mike', 'Support', agent2Password, UserRole.AGENT, 1);

    // Create customer users
    const customer1Id = uuidv4();
    const customer1Password = await bcrypt.hash('customer123', 12);
    
    db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer1Id, 'customer@deskpro.com', 'John', 'Customer', customer1Password, UserRole.CUSTOMER, 1);

    const customer2Id = uuidv4();
    const customer2Password = await bcrypt.hash('customer123', 12);
    
    db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, password, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(customer2Id, 'alice@example.com', 'Alice', 'Smith', customer2Password, UserRole.CUSTOMER, 1);

    // Create categories
    const categories = [
      { id: uuidv4(), name: 'Getting Started', description: 'Basic guides and tutorials', icon: 'rocket_launch', color: '#3B82F6' },
      { id: uuidv4(), name: 'Account Management', description: 'Managing your account and profile', icon: 'account_circle', color: '#10B981' },
      { id: uuidv4(), name: 'Troubleshooting', description: 'Common issues and solutions', icon: 'build', color: '#F59E0B' },
      { id: uuidv4(), name: 'API Documentation', description: 'Developer resources and API guides', icon: 'code', color: '#8B5CF6' }
    ];

    for (const category of categories) {
      db.prepare(`
        INSERT INTO categories (id, name, description, icon, color, order_index, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(category.id, category.name, category.description, category.icon, category.color, 1, 1);
    }

    // Create sample articles
    const articles = [
      {
        id: uuidv4(),
        title: 'How to Create Your First Ticket',
        content: `# How to Create Your First Ticket

Creating a support ticket is the first step to getting help with any issues you're experiencing. Follow these simple steps:

## Step 1: Navigate to Tickets
Click on the "Tickets" menu item in the sidebar or header navigation.

## Step 2: Click "New Ticket"
Look for the blue "New Ticket" button in the top right corner of the tickets page.

## Step 3: Fill Out the Form
- **Subject**: Provide a clear, concise description of your issue
- **Description**: Give detailed information about the problem
- **Priority**: Select the appropriate priority level
- **Tags**: Add relevant tags to help categorize your ticket

## Step 4: Submit
Click the "Create Ticket" button to submit your request.

## What Happens Next?
Once submitted, your ticket will be assigned a unique ID and our support team will review it. You'll receive email notifications for any updates.`,
        excerpt: 'Learn how to create your first support ticket with our step-by-step guide.',
        categoryId: categories[0].id,
        authorId: adminId,
        status: ArticleStatus.PUBLISHED,
        visibility: ArticleVisibility.PUBLIC,
        tags: ['tickets', 'getting-started', 'tutorial']
      },
      {
        id: uuidv4(),
        title: 'Password Reset Instructions',
        content: `# Password Reset Instructions

If you've forgotten your password or need to reset it for security reasons, follow these steps:

## Method 1: From Login Page
1. Go to the login page
2. Click "Forgot your password?" link
3. Enter your email address
4. Check your email for reset instructions
5. Click the reset link in the email
6. Enter your new password

## Password Requirements
- At least 8 characters long
- Include uppercase and lowercase letters
- Include at least one number
- Include at least one special character`,
        excerpt: 'Step-by-step instructions for resetting your password.',
        categoryId: categories[1].id,
        authorId: adminId,
        status: ArticleStatus.PUBLISHED,
        visibility: ArticleVisibility.PUBLIC,
        tags: ['password', 'security', 'account']
      }
    ];

    for (const article of articles) {
      db.prepare(`
        INSERT INTO articles (id, title, content, excerpt, category_id, author_id, status, visibility, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        article.id, article.title, article.content, article.excerpt,
        article.categoryId, article.authorId, article.status, article.visibility,
        new Date().toISOString()
      );

      // Add tags
      for (const tag of article.tags) {
        db.prepare(`
          INSERT INTO article_tags (id, article_id, tag) VALUES (?, ?, ?)
        `).run(uuidv4(), article.id, tag);
      }
    }

    // Create sample tickets
    const tickets = [
      {
        id: uuidv4(),
        subject: 'Login Issue - Cannot access account',
        description: 'I am unable to login to my account. When I enter my credentials, I get an error message.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        customerId: customer1Id,
        assignedAgentId: agent1Id,
        tags: ['login', 'urgent', 'authentication']
      },
      {
        id: uuidv4(),
        subject: 'Feature Request - Dark Mode Support',
        description: 'Would it be possible to add a dark mode option to the application?',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.NORMAL,
        customerId: customer2Id,
        assignedAgentId: agent2Id,
        tags: ['feature-request', 'ui', 'enhancement']
      },
      {
        id: uuidv4(),
        subject: 'Bug Report - File Upload Not Working',
        description: 'When trying to upload files larger than 5MB, the upload fails with a timeout error.',
        status: TicketStatus.PENDING,
        priority: TicketPriority.HIGH,
        customerId: customer1Id,
        assignedAgentId: agent1Id,
        tags: ['bug', 'file-upload', 'timeout']
      }
    ];

    for (const ticket of tickets) {
      db.prepare(`
        INSERT INTO tickets (id, subject, description, status, priority, customer_id, assigned_agent_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        ticket.id, ticket.subject, ticket.description, ticket.status,
        ticket.priority, ticket.customerId, ticket.assignedAgentId
      );

      // Add tags
      for (const tag of ticket.tags) {
        db.prepare(`
          INSERT INTO ticket_tags (id, ticket_id, tag) VALUES (?, ?, ?)
        `).run(uuidv4(), ticket.id, tag);
      }

      // Add sample comments
      db.prepare(`
        INSERT INTO ticket_comments (id, ticket_id, content, is_internal, author_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        uuidv4(), ticket.id,
        'Thank you for reporting this issue. We are looking into it.',
        0, ticket.assignedAgentId
      );
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Test Accounts:');
    console.log('Admin: admin@deskpro.com / admin123');
    console.log('Agent: agent@deskpro.com / agent123');
    console.log('Customer: customer@deskpro.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;