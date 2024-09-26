// AUTO GENERATED FILE BY @kalissaac/prisma-typegen
// DO NOT EDIT

export enum State {
	ACTIVE = 'ACTIVE',
	BANNED = 'BANNED',
	VOTE_BANNED = 'VOTE_BANNED',
	FOLLOW_BANNED = 'FOLLOW_BANNED',
	PRIVATE = 'PRIVATE'
}

export interface partnerLinks {
	id: string;
	partnerName: string;
	partner: partners;
	name: string;
	emoji: string;
	link: string;
}

export interface partners {
	id: string;
	name: string;
	logo: string;
	category: string;
	owner: string;
	ownerImage: string;
	ownerLink?: string;
	description: string;
	long_description: string;
	links: partnerLinks[];
}

export interface applications {
	creatorid: string;
	owner: users;
	name: string;
	logo: string;
	token: string;
	active: boolean;
	permissions: string[];
}

export interface plugins {
	id: number;
	postid: string;
	post: posts;
	type: string;
	href?: string;
	jsonData?: any;
}

export interface comments {
	creatorid: string;
	user: users;
	caption: string;
	image?: string;
	post: posts;
	postid: string;
	commentid: string;
}

export interface upvotes {
	id: string;
	userid: string;
	postid: string;
	post: posts;
}

export interface downvotes {
	id: string;
	userid: string;
	postid: string;
	post: posts;
}

export interface following {
	id: string;
	userid: string;
	user: users;
	targetid: string;
	target: users;
}

export interface posts {
	userid: string;
	user: users;
	caption: string;
	image?: string;
	plugins: plugins[];
	type: number;
	postid: string;
	upvotes: upvotes[];
	downvotes: downvotes[];
	comments: comments[];
	createdat: Date;
}

export interface users {
	name?: string;
	userid: string;
	discord_id?: string;
	usertag: string;
	bio: string;
	avatar: string;
	followers: following[];
	following: following[];
	badges: string[];
	state: State;
	staff_perms: string[];
	applications: applications[];
	posts: posts[];
	comments: comments[];
}
