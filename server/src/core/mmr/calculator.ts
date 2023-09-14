import { PrismaClient } from '@prisma/client';

export default class MMRCalculator {
  private prisma = new PrismaClient();
  private states = {
    maxLP: 35,
    minLP: 8,
  };

  private async updateUserRank(userId: string, rank: number, method: 'Victory' | 'Defeat'): Promise<void> {
    if (method === 'Victory') {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          rank: {
            increment: rank,
          },
        },
      });
    } else {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          rank: {
            decrement: rank,
          },
        },
      });
    }
  }

  public async winnerLP(userId: string): Promise<number> {
    const totalMatches = await this.prisma.matches.findMany({
      where: {
        users: {
          hasEvery: [userId],
        },
      },
    });
    const victorious = await this.prisma.matches.findMany({
      where: {
        winnerId: userId,
      },
    });

    if (totalMatches.length > 15) {
      const percentage = (victorious.length * 100) / totalMatches.length;
      const totalPoint = Math.round((percentage * this.states.maxLP) / 100);

      if (totalPoint > this.states.minLP) {
        await this.updateUserRank(userId, totalPoint, 'Victory');
        return totalPoint;
      }
    } else {
      await this.updateUserRank(userId, this.states.maxLP - this.states.minLP, 'Victory');
      return this.states.maxLP - this.states.minLP;
    }

    await this.updateUserRank(userId, this.states.minLP, 'Victory');
    return this.states.minLP;
  }

  public async loserLP(userId: string): Promise<number> {
    const totalMatches = await this.prisma.matches.findMany({
      where: {
        users: {
          hasEvery: [userId],
        },
      },
    });
    const defeats = await this.prisma.matches.findMany({
      where: {
        loserId: userId,
      },
    });

    if (totalMatches.length > 10) {
      const percentage = (defeats.length * 100) / totalMatches.length;
      const totalPoint = Math.round((percentage * this.states.maxLP) / 100);

      if (totalPoint > this.states.minLP) {
        await this.updateUserRank(userId, totalPoint, 'Defeat');
        return totalPoint;
      }
    }

    await this.updateUserRank(userId, this.states.minLP, 'Defeat');
    return this.states.minLP;
  }
}
