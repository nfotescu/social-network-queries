export class SocialNetworkQueries {

    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
        this.user = null;
        this.cache = {};
    }

    async findPotentialInterests(minimalScore = 0.5) {
        try {
            this.user = await this.fetchCurrentUser();

            const userBooks = this.user.ratings.map(r => r.title);

            const computedScores = this.user.friends.reduce((acc, friend) => {
                if (!friend.ratings) {
                    return acc;
                }

                friend.ratings.forEach((rating) => {
                    if (userBooks.includes(rating.title)) {
                        return;
                    }

                    if (!acc[rating.title]) {
                        acc[rating.title] = []
                    }

                    acc[rating.title].push(rating.score);
                })

                return acc;
            }, {})

            this.cache = computedScores;

            return this.getBookList(computedScores, minimalScore);

        } catch (e) {
            return this.getBookList(this.cache, minimalScore)
        }
    }



    getBookList(computedScores, minimalScore) {
        const potentialInterest = [];
        for (const [book, scores] of Object.entries(computedScores)) {
            const averageScore = scores.reduce((sum, currentValue) => sum + currentValue, 0) / scores.length;

            if (averageScore >= minimalScore) {
                potentialInterest.push({ book, averageScore });
            }
        }

        potentialInterest.sort((a, b) => {
            const score = b.averageScore - a.averageScore;
            return score === 0 ? a.book.localeCompare(b.book, "en", { sensitivity: "base" }) : score
        });

        const books = potentialInterest.map(p => p.book);

        return books;
    }
}
