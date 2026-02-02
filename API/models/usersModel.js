const db = require('../config/db');

const Users = {
    create: async (data) => {
        const sql = 'INSERT INTO users (name, password, mobile, email, roleId, isActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [data.name, data.password, data.mobile, data.email, data.roleId, data.isActive]);


            let dataJSON = {
                status: 'success',
                data: results
            }

            return dataJSON;
        } catch (err) {
            throw err; // Propagate the error to be handled later
        }
    },

    getAll: async () => {
        try {
            const [results] = await db.execute(`SELECT users.*, roles.roleName FROM users LEFT JOIN roles ON users.roleId = roles.id ORDER BY created_at DESC`);

            const modifiedResults = results.map(user => ({
                ...user,
                roleName: user.roleName
            }));

            let dataJSON = {
                status: 'success',
                data: modifiedResults
            };

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    
        
    getAllByPage: async (limit, pageNo, searchtxt) => {
        try {
            const offset = (pageNo - 1) * limit;
    
            // Base query with LEFT JOIN on the roles table
            let query = `
                SELECT 
                    users.*, 
                    roles.roleName 
                FROM 
                    users
                LEFT JOIN 
                    roles ON users.roleId = roles.id
            `;
            let queryParams = [];
    
            // Apply search filter if search text is provided
            if (searchtxt) {
                const columns = ['users.name', 'users.password', 'users.mobile', 'users.email'];  // Specify table for columns
                const searchConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
                query += ` WHERE ${searchConditions}`;
                queryParams = columns.map(() => `%${searchtxt}%`);
            }
    
            // Apply ordering and pagination
            query += ' ORDER BY users.created_at DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);
    
            // Execute the query to get paginated results with the roleName from the roles table
            const [results] = await db.execute(query, queryParams);
    
            // Get the total count of users (without filtering for pagination purposes)
            const [totalCountResults] = await db.execute('SELECT COUNT(*) AS totalCount FROM users');
            const totalCount = totalCountResults[0].totalCount;
    
            // Modify results to include roleName (this is already handled by the JOIN, but we can add it explicitly if needed)
            const modifiedResults = results.map(user => ({
                ...user,
                roleName: user.roleName  // Adding the roleName from the join (though it already exists)
            }));
    
            return {
                status: 'success',
                data: modifiedResults,
                totalCount: totalCount
            };
        } catch (err) {
            throw err;
        }
    },    


    getUserStatus: async (id) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [id]);

            let status =  results[0].isActive;

            return status;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        const fields = [];
        const params = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            params.push(data.name);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            params.push(data.email);
        }
        if (data.password !== undefined) {
            fields.push('password = ?');
            params.push(data.password);
        }
        if (data.roleId !== undefined) {
            fields.push('roleId = ?');
            params.push(data.roleId);
        }
        if (data.isActive !== undefined) {
            fields.push('isActive = ?');
            params.push(data.isActive);
        }
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.brandId !== undefined) {
            fields.push('brandId = ?');
            params.push(data.brandId);
        }
        if (data.userType !== undefined) {
            fields.push('userType = ?');
            params.push(data.userType);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        params.push(id);

        try {
            const [updateResults] = await db.execute(sql, params);

            const sqlSelect = 'SELECT * FROM users WHERE id = ?';
            const [updatedUser] = await db.execute(sqlSelect, [id]);

            if (updatedUser.length === 0) {
                throw new Error('User not found');
            }

            let dataJSON = {
                status: 'success',
                data: updatedUser[0]
            }

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },
    updateUserToken: async (id, data) => {
        const sqlUpdate = 'UPDATE users SET token = ?, updated_at = NOW() WHERE id = ?';
        try {
            db.execute(sqlUpdate, [data, id]);
        } catch (err) {
            throw err;
        }
    },

    updateUserStatus: async (id, isActive, userDetails) => {
        const sql = 'UPDATE users SET isActive = ?, updated_at = NOW() WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [isActive, id]);


            let dataJSON = {
                status: 'success',
                data: results
            };

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id, userDetails) => {
        try {
            const [results] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        try {
            const [results] = await db.execute(sql, [email]);

            return {
                status: 'success',
                data: results[0]
            };
        } catch (err) {
            throw err;
        }
    },

    getPagesByPermissionIds: async (permissions, user) => {
        // If no permissions, no pages
        if (!permissions || permissions.length === 0) return [];

        // Our permissions table uses `pageid` (and `action` as bitmask),
        // not `pageId` / canView / canAdd / canEdit / canDelete.
        const pageIds = permissions
            .map(permission => permission.pageid ?? permission.pageId)
            .filter(id => id !== undefined && id !== null);

        if (pageIds.length === 0) return [];

        const placeholders = pageIds.map(() => '?').join(', ');
        const sql = `SELECT * FROM pages WHERE pageId IN (${placeholders})`;

        try {
            const [results] = await db.execute(sql, pageIds);

            // Attach the `action` bitmask from permissions (if present)
            results.forEach(page => {
                const permission = permissions.find(
                    p => (p.pageid ?? p.pageId) == page.pageId
                );
                if (permission && permission.action !== undefined) {
                    page.action = permission.action;
                }
            });

            return results;
        } catch (err) {
            throw err;
        }
    },

    getPermissionsByRoleId: async (roleId) => {
        const sql = 'SELECT * FROM permissions WHERE roleId = ?';
        try {
            const [results] = await db.execute(sql, [roleId]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    verifyPassword: async function (inputPassword, storedPassword) {
        try {
            return inputPassword === storedPassword;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = Users;