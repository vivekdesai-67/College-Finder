import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, username } = evt.data;

    try {
      await connectDB();

      // Create user in MongoDB
      const newStudent = await Student.create({
        clerkId: id,
        username: username || email_addresses[0].email_address.split('@')[0],
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        password: 'clerk-managed', // Placeholder since Clerk manages auth
        rank: 0, // Will be updated when user completes profile
        category: 'GM', // Default category
        preferredBranch: [],
        address: '',
        phone: '',
        profileComplete: false,
      });

      console.log('✅ User synced to MongoDB:', newStudent._id);

      return new Response('User created in MongoDB', { status: 200 });
    } catch (error) {
      console.error('Error creating user in MongoDB:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username } = evt.data;

    try {
      await connectDB();

      // Update user in MongoDB
      await Student.findOneAndUpdate(
        { clerkId: id },
        {
          username: username || email_addresses[0].email_address.split('@')[0],
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
        }
      );

      console.log('✅ User updated in MongoDB');

      return new Response('User updated in MongoDB', { status: 200 });
    } catch (error) {
      console.error('Error updating user in MongoDB:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await connectDB();

      // Delete user from MongoDB
      await Student.findOneAndDelete({ clerkId: id });

      console.log('✅ User deleted from MongoDB');

      return new Response('User deleted from MongoDB', { status: 200 });
    } catch (error) {
      console.error('Error deleting user from MongoDB:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
