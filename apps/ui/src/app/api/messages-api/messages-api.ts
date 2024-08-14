import { createApi } from '@reduxjs/toolkit/query/react';
import { API_URLS } from '../../config/api-config';
import { API_CACHE_TAGS } from '../../config/api-tags';
import { Message } from '../../types/messages/Message.types';
import getFetchBaseQuery from '../fetch-base-query';

export const messagesApi = createApi({
    reducerPath: 'messagesApi',
    tagTypes: [API_CACHE_TAGS.MESSAGES],
    baseQuery: getFetchBaseQuery(API_URLS.MESSAGES),
    endpoints: builder => ({
        getMessagesByChannelId: builder.query<Message[], string>({
            query: channelId => ({
                url: `${channelId}`
            }),
            providesTags: [API_CACHE_TAGS.MESSAGES]
        }),

        createMessage: builder.mutation<
            Message,
            {
                channelId: string;
                messageData: Omit<Message, 'id' | 'isPinned' | 'createdAt' | 'user'>;
            }
        >({
            query: ({ channelId, messageData }) => ({
                url: `${channelId}`,
                method: 'POST',
                body: messageData
            }),
            invalidatesTags: [API_CACHE_TAGS.MESSAGES]
        }),

        updateMessage: builder.mutation<
            Message,
            { id: string; messageData: Omit<Message, 'id' | 'createdAt' | 'user'> }
        >({
            query: ({ id, messageData }) => ({
                url: `${id}`,
                method: 'PUT',
                body: messageData
            }),
            invalidatesTags: (_, error) => (error ? [] : [API_CACHE_TAGS.MESSAGES])
        }),

        removeMessage: builder.mutation<void, string>({
            query: id => ({
                url: `${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_, error) => (error ? [] : [API_CACHE_TAGS.MESSAGES])
        })
    })
});

export const {
    useGetMessagesByChannelIdQuery,
    useCreateMessageMutation,
    useUpdateMessageMutation,
    useRemoveMessageMutation
} = messagesApi;