package config

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() *redis.Client {
	host := getEnv("REDIS_HOST", "redis")
	port := getEnv("REDIS_PORT", "6379")
	addr := fmt.Sprintf("%s:%s", host, port)

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "", // Tanpa password default
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Gagal terhubung ke Redis di %s: %v", addr, err)
	}

	log.Printf("Koneksi Redis berhasil terhubung di %s.", addr)
	RedisClient = rdb
	return RedisClient
}

// SetCache menyimpan nilai string atau JSON ke Redis dengan masa aktif TTL
func SetCache(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if RedisClient == nil {
		return fmt.Errorf("redis client belum diinisialisasi")
	}
	return RedisClient.Set(ctx, key, value, ttl).Err()
}

// GetCache mengambil nilai dari Redis berdasarkan key
func GetCache(ctx context.Context, key string) (string, error) {
	if RedisClient == nil {
		return "", fmt.Errorf("redis client belum diinisialisasi")
	}
	return RedisClient.Get(ctx, key).Result()
}

// DeleteCache menghapus satu atau beberapa key dari Redis
func DeleteCache(ctx context.Context, keys ...string) error {
	if RedisClient == nil || len(keys) == 0 {
		return nil
	}
	return RedisClient.Del(ctx, keys...).Err()
}
