import { UserRole } from '@prisma/client';
import { compare, hashSync } from 'bcrypt';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '../../prisma/prisma-client';

//
export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: 'USER' as UserRole,
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // если credentials нет, то возвращаем null
        if (!credentials) {
          return null;
        }

        // создаем значение для поиска пользователя
        const value = {
          email: credentials.email,
        };

        // ищем пользователя в базе данных
        const findUser = await prisma.user.findFirst({
          where: value,
        });

        // если пользователь не найден, то возвращаем null
        if (!findUser) {
          return null;
        }

        // проверяем пароль
        const isPasswordValid = await compare(credentials.password, findUser.password);

        // если пароль не валид, то возвращаем null
        if (!isPasswordValid) {
          return null;
        }

        // если пользователь не верифицирован, то возвращаем null
        // if (!findUser.verified) {
        // 	return null;
        // }

        //
        return {
          id: findUser.id,
          email: findUser.email,
          name: findUser.fullName,
          role: findUser.role,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },
  callbacks: {
    //
    async signIn({ user, account }) {
      try {
        //
        if (account?.provider === 'credentials') {
          return true;
        }

        if (!user.email) {
          return false;
        }

        // ищем пользователя в базе данных
        const finduser = await prisma.user.findFirst({
          where: {
            OR: [
              { provider: account?.provider, providerId: account?.providerAccountId },
              { email: user.email },
            ],
          },
        });

        // если пользователь найден, то обновляем его данные
        if (finduser) {
          await prisma.user.update({
            where: { id: finduser.id },
            data: {
              provider: account?.provider,
              providerId: account?.providerAccountId,
            },
          });
          return true;
        }

        // если пользователь не найден, то создаем его
        await prisma.user.create({
          data: {
            email: user.email!,
            fullName: user.name || 'User#' + user.id,
            password: hashSync(user.id.toString(), 10),
            verified: new Date(),
            provider: account?.provider,
            providerId: account?.providerAccountId,
            role: 'USER',
          },
        });

        return true;
        //
      } catch (error) {
        console.error('[SIGNIN] Error', error);
        return false;
      }
    },
    //
    async jwt({ token }) {
      //

      if (!token.email) {
        return token;
      }

      //
      const findUser = await prisma.user.findFirst({
        where: { email: token.email },
      });

      //
      if (findUser) {
        token.id = String(findUser.id);
        token.email = findUser.email;
        token.fullName = findUser.fullName;
        token.role = findUser.role;
      }
      return token;
    },

    //
    session({ session, token }) {
      //
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
