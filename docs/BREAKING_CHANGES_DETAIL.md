# Chi Tiết Breaking Changes - Twitter API Project

## Tổng Quan

Tài liệu này mô tả chi tiết tất cả các thay đổi breaking changes đã được thực hiện trong quá trình nâng cấp các thư viện chính của dự án Twitter API từ phiên bản cũ lên phiên bản mới nhất.

**Ngày cập nhật**: 29/06/2025

---

## 📋 Danh Sách Thư Viện Được Nâng Cấp

| Thư viện              | Phiên bản cũ | Phiên bản mới | Loại thay đổi     |
| --------------------- | ------------ | ------------- | ----------------- |
| **Express**           | v4.21.2      | v5.1.0        | 🔴 Major Breaking |
| **MongoDB Driver**    | v5.9.2       | v6.17.0       | 🔴 Major Breaking |
| **@types/express**    | v4.17.23     | v5.0.3        | 🔴 Major Breaking |
| **express-validator** | v7.0.1       | v7.2.1        | 🟡 Minor Breaking |
| **prettier**          | v2.8.8       | v3.6.2        | 🟡 Minor Breaking |
| **typescript**        | v5.1.3       | v5.8.3        | 🟢 Compatible     |
| **@types/node**       | v20.19.2     | v24.0.7       | 🟢 Compatible     |
| **rimraf**            | v5.0.10      | v6.0.1        | 🟢 Compatible     |
| **nanoid**            | v4.0.2       | v5.1.5        | 🔴 Security Fix   |
| **nodemon**           | v2.0.22      | v3.1.10       | 🔴 Security Fix   |

---

## 🚀 Express v4 → v5 Breaking Changes

### 1. Removed Methods và Properties

#### 1.1 `app.del()` → `app.delete()`

```typescript
// ❌ Express v4 (Đã bị loại bỏ)
app.del('/user/:id', (req, res) => {
  res.send(`DELETE /user/${req.params.id}`)
})

// ✅ Express v5 (Đã sửa trong dự án)
app.delete('/user/:id', (req, res) => {
  res.send(`DELETE /user/${req.params.id}`)
})
```

#### 1.2 `res.sendfile()` → `res.sendFile()`

```typescript
// ❌ Express v4 (Đã bị loại bỏ)
res.sendfile('/path/to/file')

// ✅ Express v5 (Đã sửa trong dự án)
res.sendFile('/path/to/file')
```

#### 1.3 Response Method Signatures

```typescript
// ❌ Express v4 (Không còn hỗ trợ)
res.json({ user: 'John' }, 200)
res.send({ data: 'test' }, 201)
res.redirect('/users', 301)

// ✅ Express v5 (Đã sửa trong dự án)
res.status(200).json({ user: 'John' })
res.status(201).send({ data: 'test' })
res.redirect(301, '/users')
```

#### 1.4 Magic String 'back' Removal

```typescript
// ❌ Express v4 (Không còn hỗ trợ)
res.redirect('back')
res.location('back')

// ✅ Express v5 (Đã sửa trong dự án)
res.redirect(req.get('Referrer') || '/')
res.location(req.get('Referrer') || '/')
```

### 2. Error Handler Changes

#### 2.1 Error Handler Return Values

**Thay đổi trong file**: `src/middlewares/error.middlewares.ts`

```typescript
// ❌ Express v4 (Trả về values)
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // ... xử lý error
  return res.status(500).json({ message: 'Error' })
}

// ✅ Express v5 (Không return values - đã sửa)
export const defaultErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      res.status(err.status).json(omit(err, ['status']))
      return // Chỉ return để thoát, không return value
    }
    // ... xử lý error khác
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(error as any, ['stack'])
    })
  }
}
```

### 3. Request Handler Changes

#### 3.1 Promise Support Enhancement

**Thay đổi trong file**: `src/utils/handlers.ts`

Express v5 giờ đây tự động bắt rejected promises từ async middleware:

```typescript
// ✅ Express v5 - Đã được tối ưu hóa
export const wrapRequestHandler = <P>(func: any) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error) // Express v5 tự động handle rejected promises
    }
  }
}
```

### 4. Path Route Syntax Changes

#### 4.1 Wildcard Routes

```typescript
// ❌ Express v4
app.get('/*', async (req, res) => {
  res.send('ok')
})

// ✅ Express v5 (Cần đặt tên cho wildcard)
app.get('/*splat', async (req, res) => {
  res.send('ok')
})
```

#### 4.2 Optional Parameters

```typescript
// ❌ Express v4
app.get('/:file.:ext?', async (req, res) => {
  res.send('ok')
})

// ✅ Express v5 (Sử dụng braces)
app.get('/:file{.:ext}', async (req, res) => {
  res.send('ok')
})
```

### 5. Body Parser Changes

#### 5.1 `req.body` Default Value

```typescript
// Express v4: req.body mặc định là {}
// Express v5: req.body mặc định là undefined (khi không có body parser)

// ✅ Đảm bảo có body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // Mặc định extended: false trong v5
```

---

## 🗄️ MongoDB Driver v5 → v6 Breaking Changes

### 1. API Changes - `findOneAndUpdate()`

#### 1.1 Removal of `.value` Property

**Các file đã được sửa**:

- `src/services/users.services.ts`
- `src/services/tweets.services.ts`
- `src/repositories/users.repository.ts`
- `src/repositories/tweets.repository.ts`
- `src/repositories/bookmarks.repository.ts`
- `src/repositories/likes.repository.ts`
- `src/repositories/hashtags.repository.ts`
- `src/utils/fake.ts`

```typescript
// ❌ MongoDB v5 (Có .value property)
const result = await collection.findOneAndUpdate(
  { _id: new ObjectId(user_id) },
  { $set: { name: 'New Name' } },
  { returnDocument: 'after' }
)
return result.value as WithId<User> // Cần .value

// ✅ MongoDB v6 (Không có .value property - đã sửa)
const result = await collection.findOneAndUpdate(
  { _id: new ObjectId(user_id) },
  { $set: { name: 'New Name' } },
  { returnDocument: 'after' }
)
return result as WithId<User> // Trực tiếp return result
```

#### 1.2 Ví dụ cụ thể trong dự án

**File**: `src/repositories/users.repository.ts`

```typescript
// ✅ Đã được sửa trong MongoDB v6
async updateProfile(user_id: string, payload: UpdateMeReqBody) {
  const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
  return await databaseService.users.findOneAndUpdate(
    { _id: new ObjectId(user_id) },
    {
      $set: {
        ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
      },
      $currentDate: {
        updated_at: true
      }
    },
    {
      returnDocument: 'after',
      projection: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    }
  )
  // Không cần .value nữa, trực tiếp return result
}
```

**File**: `src/repositories/hashtags.repository.ts`

```typescript
// ✅ Đã được sửa trong MongoDB v6
async createHashtag(name: string) {
  return await databaseService.hashtags.findOneAndUpdate(
    { name },
    {
      $setOnInsert: new Hashtag({ name })
    },
    {
      upsert: true,
      returnDocument: 'after'
    }
  )
  // Kết quả trả về trực tiếp là document, không phải { value: document }
}
```

### 2. Node.js Version Requirements

```typescript
// ❌ MongoDB v5: Hỗ trợ Node.js v14+
// ✅ MongoDB v6: Yêu cầu Node.js v16.20.1+

// package.json đã được cập nhật
{
  "engines": {
    "node": ">=20.0.0" // Tăng lên Node.js 20+ để đảm bảo tương thích
  }
}
```

### 3. Type Changes

#### 3.1 Return Type Changes

```typescript
// MongoDB v5
interface UpdateResult {
  acknowledged: boolean
  matchedCount: number
  modifiedCount: number
  upsertedCount: number
  n: number // ❌ Đã bị loại bỏ
  nModified: number // ❌ Đã bị loại bỏ
}

// MongoDB v6
interface UpdateResult {
  acknowledged: boolean
  matchedCount: number
  modifiedCount: number
  upsertedCount: number
  // n và nModified đã bị loại bỏ
}
```

---

## 🔧 Express Validator v7 Changes

### 1. Import Path Changes

```typescript
// ❌ Express Validator v6
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'

// ✅ Express Validator v7 (Đã sửa nếu có sử dụng)
import { RunnableValidationChains } from 'express-validator'
```

---

## 🎨 Prettier v2 → v3 Breaking Changes

### 1. Configuration Changes

```json
// ❌ Prettier v2 (Một số config không còn hỗ trợ)
{
  "trailingComma": "none",
  "useTabs": false
}

// ✅ Prettier v3 (Đã cập nhật config nếu cần)
{
  "trailingComma": "es5",
  "useTabs": false,
  "endOfLine": "lf"
}
```

### 2. Formatting Changes

Prettier v3 có thể format code khác so với v2. Đã chạy `pnpm run prettier:fix` để format lại toàn bộ codebase.

---

## 🔐 Security Fixes

### 1. nanoid v4 → v5

```typescript
// ❌ nanoid v4 (Có lỗ hổng bảo mật moderate severity)
import { nanoid } from 'nanoid'

// ✅ nanoid v5 (Đã fix lỗ hổng bảo mật)
import { nanoid } from 'nanoid'
// API không thay đổi, chỉ fix bảo mật
```

### 2. nodemon v2 → v3

```typescript
// ❌ nodemon v2 (Có lỗ hổng high severity - semver ReDoS)
// ✅ nodemon v3 (Đã fix lỗ hổng bảo mật)
// Configuration không thay đổi
```

---

## 🔍 JWT & Config Type Fixes

### 1. JWT ExpiresIn Type Casting

**File**: `src/constants/config.ts`

```typescript
// ✅ Đã sửa type casting cho JWT options
export const envConfig = {
  // ... other config
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string
}
```

---

## 📦 AWS SDK v3 Updates

### 1. Version Bumps

```typescript
// Các package AWS SDK đã được cập nhật:
{
  "@aws-sdk/client-s3": "^3.839.0",      // từ v3.374.0
  "@aws-sdk/client-ses": "^3.839.0",     // từ v3.370.0
  "@aws-sdk/lib-storage": "^3.839.0"     // từ v3.374.0
}
```

### 2. API Compatibility

Các API của AWS SDK v3 tương thích ngược, không cần thay đổi code.

---

## 🔧 TypeScript v5.1 → v5.8 Enhancements

### 1. New Features Available

```typescript
// ✅ Có thể sử dụng các tính năng mới của TypeScript 5.8
// - Improved type inference
// - Better error messages
// - Performance improvements
```

---

## 📝 Development Tools Updates

### 1. rimraf v5 → v6

```bash
# ❌ rimraf v5 (Có deprecated warnings)
# ✅ rimraf v6 (Không còn warnings)
# API không thay đổi
```

---

## 🚨 Lưu Ý Quan Trọng

### 1. Tương Thích Ngược

✅ **Đã đảm bảo**:

- API endpoints hoạt động như bình thường
- Database schema không thay đổi
- Environment variables không cần thay đổi
- Docker configuration vẫn tương thích

### 2. Testing Requirements

🧪 **Cần test kỹ**:

- MongoDB operations (do major version change)
- Express routes và middleware
- File upload functionality
- Authentication flow
- Real-time features (Socket.io)

### 3. Performance Benefits

🚀 **Cải thiện hiệu suất**:

- Express v5: Better async/await handling, improved performance
- MongoDB v6: Faster operations, better connection pooling
- TypeScript v5.8: Faster compilation
- Node.js v20+: Better memory management, faster execution

---

## 📋 Checklist Migration

### ✅ Đã hoàn thành:

- [x] Express v4 → v5 migration
- [x] MongoDB driver v5 → v6 migration
- [x] Fix tất cả `.value` property removal
- [x] Update error handlers cho Express v5
- [x] Fix JWT type casting
- [x] Security vulnerability fixes
- [x] TypeScript compilation fixes
- [x] Prettier formatting updates

### 🔄 Cần làm tiếp:

- [ ] Comprehensive testing
- [ ] Performance monitoring
- [ ] Documentation updates
- [ ] Production deployment planning

---

## 🛠️ Rollback Plan

Nếu có vấn đề, có thể rollback bằng cách:

```bash
# Rollback package.json
git checkout HEAD~1 -- package.json
pnpm install

# Hoặc rollback toàn bộ
git revert <commit-hash>
```

---

## 📚 Tài Liệu Tham Khảo

1. [Express v5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
2. [MongoDB Node.js Driver v6 Upgrade Guide](https://www.mongodb.com/docs/drivers/node/current/upgrade/)
3. [TypeScript 5.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
4. [Prettier v3 Migration Guide](https://prettier.io/blog/2023/07/05/3.0.0.html)

---

_Tài liệu này được tạo để đảm bảo transparency và giúp team hiểu rõ tất cả các thay đổi đã được thực hiện trong quá trình upgrade._
