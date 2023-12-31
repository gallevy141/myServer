const express = require('express')
const router = express.Router()
const pool = require('../dal')


router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        const query = `
          SELECT c.userID, c.productID, c.quantity, p.name, p.image, p.price
          FROM Cart c
          JOIN Products p ON c.productID = p.productID
          WHERE c.userID = ?
        `
        const [items] = await pool.query(query, [userId])
        res.json(items)
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})


router.post('/:userId/add', async (req, res) => {
    const { userId } = req.params
    const { productId, quantity } = req.body;

    try {
        const [existing] = await pool.query('SELECT * FROM Cart WHERE userID = ? AND productID = ?', [userId, productId])
        if (existing.length) {
            await pool.query('UPDATE Cart SET quantity = quantity + ? WHERE userID = ? AND productID = ?', [quantity, userId, productId])
        } else {
            await pool.query('INSERT INTO Cart (userID, productID, quantity) VALUES (?, ?, ?)', [userId, productId, quantity])
        }
        res.status(200).json({ message: 'Product added/updated in cart' })
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})

router.delete('/:userId/remove/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await pool.query('DELETE FROM Cart WHERE userID = ? AND productID = ?', [userId, productId])
        res.status(200).json({ message: 'Product removed from cart' })
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})

router.put('/:userId/update/:productId', async (req, res) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    try {
        const [existing] = await pool.query('SELECT * FROM Cart WHERE userID = ? AND productID = ?', [userId, productId])
        if (existing.length) {
            await pool.query('UPDATE Cart SET quantity = ? WHERE userID = ? AND productID = ?', [quantity, userId, productId])
            res.status(200).json({ message: 'Product quantity updated in cart' })
        } else {
            res.status(404).json({ message: 'Product not found in cart' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})

router.delete('/:userId/clear', async function(req, res) {
    try {
        await pool.query('DELETE FROM Cart WHERE userID = ?', [req.params.userId])
        res.status(200).json({ message: 'Cart cleared successfully.' })
    } catch (error) {
        res.status(500).json({ error: 'Error clearing the cart.' })
    }
})

module.exports = router