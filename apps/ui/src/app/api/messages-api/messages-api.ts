import { API_CACHE_TAGS } from '../../config/api-tags';
import { API_URLS } from '../../config/api-config';
import { Message } from '../../types/messages/Message.types';
import { createApi } from '@reduxjs/toolkit/query/react';
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
            providesTags: (result, _error, channelId) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: API_CACHE_TAGS.MESSAGES, id })),
                          { type: API_CACHE_TAGS.MESSAGES, id: channelId }
                      ]
                    : [{ type: API_CACHE_TAGS.MESSAGES, id: channelId }]
        }),
        addMessage: builder.mutation<Message, { channelId: string; message: Message }>({
            queryFn: ({ message }) => ({ data: message }),
            async onQueryStarted({ channelId, message }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    messagesApi.util.updateQueryData('getMessagesByChannelId', channelId, draft => {
                        draft.push(message);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
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
    useRemoveMessageMutation,
    useAddMessageMutation
} = messagesApi;
