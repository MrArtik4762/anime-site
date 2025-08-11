const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { HTTP_STATUS, ERROR_MESSAGES } = require('/app/shared/constants/constants');

class FriendshipController {
  // РџРѕР»СѓС‡РµРЅРёРµ СЃРїРёСЃРєР° РґСЂСѓР·РµР№
  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, sort = 'acceptedAt' } = req.query;

      const sortOptions = {};
      sortOptions[sort] = sort === 'username' ? 1 : -1;

      const friends = await Friendship.getFriends(userId, {
        populate: true,
        sort: sortOptions,
        limit: parseInt(limit)
      });

      // Р¤РѕСЂРјР°С‚РёСЂСѓРµРј СЃРїРёСЃРѕРє РґСЂСѓР·РµР№
      const friendsList = friends.map(friendship => {
        const friend = friendship.getFriend(userId);
        return {
          friendshipId: friendship._id,
          friend: {
            id: friend._id,
            username: friend.username,
            avatar: friend.getAvatarUrl(),
            bio: friend.bio,
            statistics: friend.statistics,
            joinDate: friend.createdAt
          },
          friendshipInfo: {
            since: friendship.acceptedAt,
            mutualFriends: friendship.metadata.mutualFriends,
            commonAnime: friendship.metadata.commonAnime,
            lastInteraction: friendship.metadata.lastInteraction
          }
        };
      });

      // РџРѕР»СѓС‡Р°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РґСЂСѓР·РµР№
      const friendStats = await Friendship.getFriendStats(userId);

      res.json({
        success: true,
        data: {
          friends: friendsList,
          statistics: friendStats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: friendsList.length
          }
        }
      });

    } catch (error) {
      console.error('Get friends error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РІС…РѕРґСЏС‰РёС… Р·Р°РїСЂРѕСЃРѕРІ РІ РґСЂСѓР·СЊСЏ
  async getPendingRequests(req, res) {
    try {
      const userId = req.user.id;
      const { type = 'received' } = req.query;

      const requests = await Friendship.getPendingRequests(userId, type);

      const formattedRequests = requests.map(request => ({
        requestId: request._id,
        requester: {
          id: request.requester._id,
          username: request.requester.username,
          avatar: request.requester.getAvatarUrl(),
          bio: request.requester.bio,
          statistics: request.requester.statistics
        },
        recipient: {
          id: request.recipient._id,
          username: request.recipient.username,
          avatar: request.recipient.getAvatarUrl()
        },
        sentAt: request.createdAt,
        mutualFriends: request.metadata.mutualFriends,
        commonAnime: request.metadata.commonAnime
      }));

      res.json({
        success: true,
        data: {
          requests: formattedRequests,
          type,
          total: formattedRequests.length
        }
      });

    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћС‚РїСЂР°РІРєР° Р·Р°РїСЂРѕСЃР° РІ РґСЂСѓР·СЊСЏ
  async sendFriendRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const { recipientId } = req.body;

      // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ РїРѕР»СѓС‡Р°С‚РµР»СЏ
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      const friendship = await Friendship.sendFriendRequest(requesterId, recipientId);

      res.json({
        success: true,
        data: {
          friendship
        },
        message: `Р—Р°РїСЂРѕСЃ РІ РґСЂСѓР·СЊСЏ РѕС‚РїСЂР°РІР»РµРЅ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ ${recipient.username}`
      });

    } catch (error) {
      console.error('Send friend request error:', error);
      
      if (error.message.includes('РќРµР»СЊР·СЏ') || error.message.includes('СѓР¶Рµ')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: error.message
          }
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџСЂРёРЅСЏС‚РёРµ Р·Р°РїСЂРѕСЃР° РІ РґСЂСѓР·СЊСЏ
  async acceptFriendRequest(req, res) {
    try {
      const recipientId = req.user.id;
      const { requesterId } = req.body;

      const friendship = await Friendship.acceptFriendRequest(requesterId, recipientId);

      if (!friendship) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїСЂРѕСЃ РІ РґСЂСѓР·СЊСЏ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      const requester = await User.findById(requesterId);

      res.json({
        success: true,
        data: {
          friendship
        },
        message: `Р’С‹ С‚РµРїРµСЂСЊ РґСЂСѓР·СЊСЏ СЃ ${requester.username}`
      });

    } catch (error) {
      console.error('Accept friend request error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РћС‚РєР»РѕРЅРµРЅРёРµ Р·Р°РїСЂРѕСЃР° РІ РґСЂСѓР·СЊСЏ
  async rejectFriendRequest(req, res) {
    try {
      const recipientId = req.user.id;
      const { requesterId } = req.body;

      const result = await Friendship.rejectFriendRequest(requesterId, recipientId);

      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р—Р°РїСЂРѕСЃ РІ РґСЂСѓР·СЊСЏ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      res.json({
        success: true,
        message: 'Р—Р°РїСЂРѕСЃ РІ РґСЂСѓР·СЊСЏ РѕС‚РєР»РѕРЅРµРЅ'
      });

    } catch (error) {
      console.error('Reject friend request error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РЈРґР°Р»РµРЅРёРµ РёР· РґСЂСѓР·РµР№
  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;

      const result = await Friendship.removeFriend(userId, friendId);

      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Р”СЂСѓР¶Р±Р° РЅРµ РЅР°Р№РґРµРЅР°'
          }
        });
      }

      const friend = await User.findById(friendId);

      res.json({
        success: true,
        message: `${friend?.username || 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ'} СѓРґР°Р»РµРЅ РёР· РґСЂСѓР·РµР№`
      });

    } catch (error) {
      console.error('Remove friend error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // Р‘Р»РѕРєРёСЂРѕРІРєР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  async blockUser(req, res) {
    try {
      const blockerId = req.user.id;
      const { blockedId } = req.body;

      // РџСЂРѕРІРµСЂСЏРµРј СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const blockedUser = await User.findById(blockedId);
      if (!blockedUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ'
          }
        });
      }

      const friendship = await Friendship.blockUser(blockerId, blockedId);

      res.json({
        success: true,
        data: {
          friendship
        },
        message: `РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ ${blockedUser.username} Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ`
      });

    } catch (error) {
      console.error('Block user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕРёСЃРє РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РІ РґСЂСѓР·СЊСЏ
  async searchUsers(req, res) {
    try {
      const currentUserId = req.user.id;
      const { query, page = 1, limit = 10 } = req.query;

      if (!query || query.length < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Р—Р°РїСЂРѕСЃ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј 2 СЃРёРјРІРѕР»Р°'
          }
        });
      }

      // РџРѕРёСЃРє РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ РїРѕ username РёР»Рё email
      const users = await User.find({
        $and: [
          { _id: { $ne: currentUserId } }, // РСЃРєР»СЋС‡Р°РµРј С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
          {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          },
          { isActive: true },
          { 'preferences.publicProfile': true }
        ]
      })
      .select('username avatar bio statistics createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

      // РџСЂРѕРІРµСЂСЏРµРј СЃС‚Р°С‚СѓСЃ РґСЂСѓР¶Р±С‹ РґР»СЏ РєР°Р¶РґРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const usersWithFriendshipStatus = await Promise.all(
        users.map(async (user) => {
          const friendshipStatus = await Friendship.getFriendshipStatus(currentUserId, user._id);
          const mutualData = await Friendship.getMutualData(currentUserId, user._id);
          
          return {
            id: user._id,
            username: user.username,
            avatar: user.getAvatarUrl(),
            bio: user.bio,
            statistics: user.statistics,
            joinDate: user.createdAt,
            friendshipStatus,
            mutualFriends: mutualData.mutualFriends,
            commonAnime: mutualData.commonAnime
          };
        })
      );

      res.json({
        success: true,
        data: {
          users: usersWithFriendshipStatus,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: usersWithFriendshipStatus.length
          }
        }
      });

    } catch (error) {
      console.error('Search users error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЂРµРєРѕРјРµРЅРґР°С†РёР№ РґСЂСѓР·РµР№
  async getFriendRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      // РџРѕР»СѓС‡Р°РµРј РґСЂСѓР·РµР№ С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
      const currentFriends = await Friendship.getFriends(userId);
      const friendIds = currentFriends.map(f => 
        f.requester.toString() === userId ? f.recipient : f.requester
      );

      // РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ СЃ РѕР±С‰РёРјРё РґСЂСѓР·СЊСЏРјРё
      const recommendations = await User.aggregate([
        {
          $match: {
            _id: { $nin: [...friendIds, mongoose.Types.ObjectId(userId)] },
            isActive: true,
            'preferences.publicProfile': true
          }
        },
        {
          $lookup: {
            from: 'friendships',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$status', 'accepted'] },
                      {
                        $or: [
                          {
                            $and: [
                              { $eq: ['$requester', '$$userId'] },
                              { $in: ['$recipient', friendIds] }
                            ]
                          },
                          {
                            $and: [
                              { $eq: ['$recipient', '$$userId'] },
                              { $in: ['$requester', friendIds] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'mutualFriendships'
          }
        },
        {
          $addFields: {
            mutualFriendsCount: { $size: '$mutualFriendships' }
          }
        },
        {
          $match: {
            mutualFriendsCount: { $gt: 0 }
          }
        },
        {
          $sort: { mutualFriendsCount: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $project: {
            username: 1,
            avatar: 1,
            bio: 1,
            statistics: 1,
            createdAt: 1,
            mutualFriendsCount: 1
          }
        }
      ]);

      // Р”РѕР±Р°РІР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ РѕР± РѕР±С‰РёС… Р°РЅРёРјРµ
      const recommendationsWithDetails = await Promise.all(
        recommendations.map(async (user) => {
          const mutualData = await Friendship.getMutualData(userId, user._id);
          return {
            ...user,
            avatar: User.prototype.getAvatarUrl.call({ avatar: user.avatar, username: user.username }),
            mutualFriends: mutualData.mutualFriends,
            commonAnime: mutualData.commonAnime,
            recommendationScore: mutualData.mutualFriends * 2 + mutualData.commonAnime
          };
        })
      );

      // РЎРѕСЂС‚РёСЂСѓРµРј РїРѕ СЂРµРєРѕРјРµРЅРґР°С‚РµР»СЊРЅРѕРјСѓ СЃС‡РµС‚Сѓ
      recommendationsWithDetails.sort((a, b) => b.recommendationScore - a.recommendationScore);

      res.json({
        success: true,
        data: {
          recommendations: recommendationsWithDetails
        }
      });

    } catch (error) {
      console.error('Get friend recommendations error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }

  // РџРѕР»СѓС‡РµРЅРёРµ СЃС‚Р°С‚СѓСЃР° РґСЂСѓР¶Р±С‹ СЃ РєРѕРЅРєСЂРµС‚РЅС‹Рј РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј
  async getFriendshipStatus(req, res) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;

      const status = await Friendship.getFriendshipStatus(userId, targetUserId);
      const mutualData = await Friendship.getMutualData(userId, targetUserId);

      res.json({
        success: true,
        data: {
          status,
          mutualFriends: mutualData.mutualFriends,
          commonAnime: mutualData.commonAnime
        }
      });

    } catch (error) {
      console.error('Get friendship status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  }
}

module.exports = new FriendshipController();
