const testLines = async (cfg) => {
	const {
		test: t,
		fetchLines,
		validate,
		query,
	} = cfg;

	const res = await fetchLines(query);
	console.log('*** res', JSON.stringify(res, null, 2));
	const {
		lines,
		realtimeDataUpdatedAt,
	} = res;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const name = `res.lines[${i}]`;
		validate(t, line, 'line', name);
	}
	console.log('*** t', t);
	console.log('*** realtimeDataUpdatedAt', realtimeDataUpdatedAt);
	validate(t, realtimeDataUpdatedAt, 'realtimeDataUpdatedAt', 'res.realtimeDataUpdatedAt');
};

export {
	testLines,
};
