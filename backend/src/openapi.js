
const port = process.env.PORT || 4000;

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SRMS API',
    version: '1.0.0',
    description: 'Service Request Management System API documentation.',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Local development server',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Returns basic information about API health and uptime.',
        responses: {
          '200': {
            description: 'API is healthy',
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        summary: 'Log in',
        description: 'Authenticate a user and return a JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['email', 'password'],
              },
              example: {
                email: 'user@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Logged in' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Current user',
        description: 'Get the profile for the currently authenticated user.',
        responses: {
          '200': { description: 'User profile' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/register-employee': {
      post: {
        summary: 'Register employee',
        description: 'Public endpoint to register a new employee account.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['full_name', 'email', 'password'],
              },
              example: {
                full_name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Employee registered' },
        },
      },
    },

    '/api/users': {
      get: {
        summary: 'List users',
        description: 'Admin-only list of all users.',
        responses: {
          '200': { description: 'Array of users' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        summary: 'Create user',
        description: 'Admin-only: create a new user (optionally with avatar).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  role: {
                    type: 'string',
                    enum: ['ADMIN', 'TECHNICIAN', 'EMPLOYEE'],
                  },
                  department_id: { type: 'integer', nullable: true },
                  is_active: { type: 'boolean' },
                  username: { type: 'string' },
                  phone: { type: 'string' },
                },
                required: ['full_name', 'email', 'password'],
              },
              example: {
                full_name: 'Tech User',
                email: 'tech@example.com',
                password: 'password123',
                role: 'TECHNICIAN',
                department_id: 1,
                is_active: true,
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        description: 'Get a user profile (self or admin).',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update user',
        description: 'Update a user profile (self or admin).',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: {
                    type: 'string',
                    enum: ['ADMIN', 'TECHNICIAN', 'EMPLOYEE'],
                  },
                  department_id: { type: 'integer', nullable: true },
                  is_active: { type: 'boolean' },
                  username: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                },
              },
              example: {
                full_name: 'Updated Name',
                role: 'EMPLOYEE',
                department_id: 2,
                is_active: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated user' },
        },
      },
      delete: {
        summary: 'Deactivate user',
        description: 'Admin-only: deactivate a user.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'User deactivated' },
        },
      },
    },

    '/api/departments': {
      get: {
        summary: 'List departments',
        description: 'Public list of departments.',
        responses: {
          '200': { description: 'Array of departments' },
        },
      },
      post: {
        summary: 'Create department',
        description: 'Admin-only: create a new department.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                },
                required: ['name'],
              },
              example: {
                name: 'IT',
                description: 'Information Technology',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Department created' },
        },
      },
    },
    '/api/departments/{id}': {
      put: {
        summary: 'Update department',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                },
                required: ['name'],
              },
              example: {
                name: 'Updated department',
                description: 'Updated description',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Department updated' },
        },
      },
      delete: {
        summary: 'Delete department',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Department deleted' },
        },
      },
    },

    '/api/categories': {
      get: {
        summary: 'List categories',
        responses: {
          '200': { description: 'Array of categories' },
        },
      },
      post: {
        summary: 'Create category',
        description: 'Admin-only: create a category.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  is_active: { type: 'boolean' },
                },
                required: ['name'],
              },
              example: {
                name: 'Hardware',
                description: 'Hardware-related issues',
                is_active: true,
              },
            },
          },
        },
        responses: {
          '201': { description: 'Category created' },
        },
      },
    },
    '/api/categories/{id}': {
      put: {
        summary: 'Update category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  is_active: { type: 'boolean' },
                },
                required: ['name'],
              },
              example: {
                name: 'Updated category',
                description: 'Updated description',
                is_active: true,
              },
            },
          },
        },
        responses: {
          '200': { description: 'Category updated' },
        },
      },
      delete: {
        summary: 'Delete category',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Category deleted' },
        },
      },
    },

    '/api/tickets': {
      get: {
        summary: 'List tickets',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'],
            },
            description: 'Filter by ticket status',
          },
          {
            name: 'department_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by department',
          },
          {
            name: 'category_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by category',
          },
          {
            name: 'mine',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
            description: "If 'true' and role is EMPLOYEE, only own tickets.",
          },
          {
            name: 'assigned',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
            description: "If 'true' and role is TECHNICIAN, only assigned tickets.",
          },
        ],
        responses: {
          '200': { description: 'Array of tickets' },
        },
      },
      post: {
        summary: 'Create ticket',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  department_id: { type: 'integer' },
                  category_id: { type: 'integer' },
                  priority: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  },
                  requester_id: {
                    type: 'integer',
                    description: 'Only used when admin creates on behalf of an employee.',
                  },
                },
                required: ['title'],
              },
              example: {
                title: 'PC not turning on',
                description: 'My workstation does not power on.',
                department_id: 1,
                category_id: 2,
                priority: 'HIGH',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Ticket created' },
        },
      },
    },
    '/api/tickets/{id}': {
      get: {
        summary: 'Get ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Ticket' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tickets/{id}/status': {
      patch: {
        summary: 'Change ticket status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'],
                  },
                },
                required: ['status'],
              },
              example: { status: 'IN_PROGRESS' },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
        },
      },
    },
    '/api/tickets/{id}/assign': {
      patch: {
        summary: 'Assign ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  assigned_to_id: { type: 'integer' },
                },
                required: ['assigned_to_id'],
              },
              example: { assigned_to_id: 5 },
            },
          },
        },
        responses: {
          '200': { description: 'Ticket assigned' },
        },
      },
    },
    '/api/tickets/{id}/logs': {
      get: {
        summary: 'Ticket logs',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Array of logs' },
        },
      },
    },
    '/api/tickets/{id}/attachments': {
      get: {
        summary: 'List ticket attachments',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Array of attachments' },
        },
      },
      post: {
        summary: 'Upload ticket attachment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Attachment uploaded' },
        },
      },
    },
    '/api/tickets/{id}/notes': {
      post: {
        summary: 'Add ticket note',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  note: { type: 'string' },
                  time_spent_minutes: { type: 'integer', nullable: true },
                },
                required: ['note'],
              },
              example: {
                note: 'Investigated the issue and replaced power supply.',
                time_spent_minutes: 45,
              },
            },
          },
        },
        responses: {
          '201': { description: 'Note added' },
        },
      },
    },
    '/api/tickets/{id}/employee-update': {
      patch: {
        summary: 'Employee update own ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  },
                  department_id: { type: 'integer' },
                  category_id: { type: 'integer' },
                },
                required: ['title', 'description'],
              },
              example: {
                title: 'Updated ticket title',
                description: 'More accurate description of the problem.',
                priority: 'HIGH',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Ticket updated' },
        },
      },
    },
    '/api/tickets/{id}/feedback': {
      post: {
        summary: 'Submit ticket feedback',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string', nullable: true },
                },
                required: ['rating'],
              },
              example: {
                rating: 5,
                comment: 'Great support, issue resolved quickly.',
              },
            },
          },
        },
        responses: {
          '201': { description: 'Feedback stored' },
        },
      },
    },

    '/api/dashboard/technician-performance': {
      get: {
        summary: 'Technician performance (admin)',
        responses: {
          '200': { description: 'Technician performance data' },
        },
      },
    },
    '/api/dashboard/summary': {
      get: {
        summary: 'Admin summary',
        responses: {
          '200': { description: 'Summary stats' },
        },
      },
    },
    '/api/dashboard/technician-summary': {
      get: {
        summary: 'Technician summary',
        responses: {
          '200': { description: 'Summary for logged-in technician' },
        },
      },
    },
    '/api/dashboard/technician-rating': {
      get: {
        summary: 'Technician rating',
        responses: {
          '200': { description: 'Rating for logged-in technician' },
        },
      },
    },
    '/api/dashboard/technician-task-rating': {
      get: {
        summary: 'Technician task rating',
        responses: {
          '200': { description: 'Task rating for logged-in technician' },
        },
      },
    },

    '/api/tasks': {
      get: {
        summary: 'List tasks',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              description: 'Filter by task status (OPEN, IN_PROGRESS, DONE, etc.)',
            },
          },
          {
            name: 'assigned_to',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter tasks assigned to a specific user',
          },
        ],
        responses: {
          '200': { description: 'Array of tasks' },
        },
      },
      post: {
        summary: 'Create task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  assigned_to: { type: 'integer', nullable: true },
                  due_date: { type: 'string', format: 'date-time', nullable: true },
                  technician_note: { type: 'string', nullable: true },
                  technician_rating: { type: 'integer', nullable: true },
                },
                required: ['title'],
              },
              example: {
                title: 'Install new software',
                description: 'Install antivirus on 10 PCs',
                priority: 'MEDIUM',
                assigned_to: 3,
              },
            },
          },
        },
        responses: {
          '201': { description: 'Task created' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Task' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  assigned_to: { type: 'integer', nullable: true },
                  due_date: { type: 'string', format: 'date-time', nullable: true },
                  technician_note: { type: 'string', nullable: true },
                  technician_rating: { type: 'integer', nullable: true },
                },
              },
              example: {
                status: 'IN_PROGRESS',
                technician_note: 'Started working on this task.',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Task updated' },
        },
      },
      delete: {
        summary: 'Delete task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Task deleted' },
        },
      },
    },
    '/api/tasks/{id}/progress': {
      get: {
        summary: 'Get task progress',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Task progress' },
        },
      },
    },
    '/api/tasks/{id}/progress/{progressId}/admin-comment': {
      put: {
        summary: 'Update task progress admin comment',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'progressId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  admin_comment: { type: 'string' },
                },
                required: ['admin_comment'],
              },
              example: {
                admin_comment: 'Reviewed progress, looks good.',
              },
            },
          },
        },
        responses: {
          '200': { description: 'Admin comment updated' },
        },
      },
    },

    '/api/notifications': {
      get: {
        summary: 'List notifications',
        description: 'List notifications for the current user.',
        parameters: [
          {
            name: 'unread',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
            description: "If 'true', only return unread notifications.",
          },
        ],
        responses: {
          '200': { description: 'Array of notifications' },
        },
      },
    },
    '/api/notifications/{id}/read': {
      post: {
        summary: 'Mark notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Notification marked as read' },
        },
      },
    },
    '/api/notifications/read-all': {
      post: {
        summary: 'Mark all notifications as read',
        responses: {
          '200': { description: 'All notifications marked as read' },
        },
      },
    },
  },
};

export default openApiSpec;
