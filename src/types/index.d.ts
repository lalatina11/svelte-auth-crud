
export interface Todo {
    title: string;
    completed: boolean;
    id: number
}

export interface PostWithUser {
    id: number;
    description: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
    };
}