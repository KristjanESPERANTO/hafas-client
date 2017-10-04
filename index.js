'use strict'

const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})
const {stringify} = require('query-string')

const parse = require('./parse')



const id = (x) => x
const defaults = {
	onBody:     id,
	onReq:      id,
	onLocation: parse.location,
	onLine: parse.line,
	onRemark:   parse.remark,
	onOperator: parse.operator
}



const createRequest = (opt) => {
	opt = Object.assign({}, defaults, opt)

	const request = (data) => {
		const body = opt.onBody({lang: 'en', svcReqL: [data]})
		const req = opt.onReq({
			method: 'post',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				'Accept-Encoding': 'gzip, deflate',
				'user-agent': 'https://github.com/derhuerst/hafas-client'
			},
			query: null
		})
		const url = opt.endpoint + (req.query ? '?' + stringify(req.query) : '')

		return fetch(url, req)
		.then((res) => {
			if (!res.ok) {
				const err = new Error(res.statusText)
				err.statusCode = res.status
				err.isHafasError = true
				throw err
			}
			return res.json()
		})
		.then((b) => {
			if (b.err) throw hafasError(b.err)
			if (!b.svcResL || !b.svcResL[0]) throw new Error('invalid response')
			if (b.svcResL[0].err !== 'OK') throw hafasError(b.svcResL[0].errTxt)
			const d = b.svcResL[0].res
			const c = d.common || {}

			if (Array.isArray(c.locL)) d.locations = c.locL.map(opt.onLocation)
			if (Array.isArray(c.prodL)) d.lines = c.prodL.map(opt.onLine)
			if (Array.isArray(c.remL)) d.remarks = c.remL.map(opt.onRemark)
			if (Array.isArray(c.opL)) d.operators = c.opL.map(opt.onOperator)
			return d
		})
	}

	return request
}

module.exports = createRequest
