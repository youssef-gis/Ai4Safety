import { hash } from '@node-rs/argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const users = [
  {
    username: "admin",
    email: "admin@admin.com",
    emailVerified: true
  },
  {
    username: "user",
    // use your own email here
    email: "youssef.arhib@gmail.com",
    emailVerified: true
  },
];

const tickets = [
  {
    title: "Ticket 1",
    content: "First ticket from DB.",
    status: "Done" as const,
    deadline: new Date().toISOString().split("T")[0],
    bounty: 499,
  },
  {
    title: "Ticket 2",
    content: "Second ticket from DB.",
    status: "Open" as const,
    deadline: new Date().toISOString().split("T")[0],
    bounty: 399,
  },
  {
    title: "Ticket 3",
    content: "Third ticket from DB.",
    status: "IN_PROGRESS" as const,
    deadline: new Date().toISOString().split("T")[0],
    bounty: 599,
  },
];

const comments = [
  {content: 'First comment from DB'},
  {content: 'Second comment from DB'},
  {content: 'Third comment from DB'},
]

const seed = async () => {
    
    await prisma.comment.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.membership.deleteMany();

    const dbOrganization = await prisma.organization.create({
      data:{
        name:'Acme Corp',
        
      }
    })

    const passwordHash = await hash("geheimnis");

    const dbUsers = await prisma.user.createManyAndReturn({
        data: users.map((user) => ({
      ...user,
      passwordHash,
        })),
    });

    await prisma.membership.createMany({
      data:[{
        organizationId: dbOrganization.id,
        userId: dbUsers[0].id,
        isActive: true,
        membershipRole:"ADMIN",
        
      },{
        organizationId: dbOrganization.id,
        userId: dbUsers[1].id,
        isActive: false,
        membershipRole:'MEMBER',
        
      },]
    });


    const dbTickets= await prisma.ticket.createManyAndReturn({
        data: tickets.map((ticket) => ({
        ...ticket,
        userId: dbUsers[0].id,
        organizationId: dbOrganization.id,
        })),
    });

    await prisma.comment.createManyAndReturn({
      data: comments.map((comment)=>({
        ...comment,
        userId:  dbUsers[1].id,
        ticketId: dbTickets[0].id,
      })),
    });
}

seed()