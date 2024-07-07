const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

// API endpoint
const API_URL = 'https://markdevs-api.onrender.com/api/gpt4o';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('Replies with information based on a prompt!')
		.addStringOption(option =>
			option.setName('prompt')
				.setDescription('The prompt to send to the AI')
				.setRequired(true)),
	async execute(interaction) {
		const prompt = interaction.options.getString('prompt');

		// Acknowledge the interaction and defer the reply to give the bot more time
		await interaction.deferReply();

		const fetchResponse = async (prompt) => {
			try {
				const response = await axios.get(API_URL, { params: { q: prompt } });
				if (response.data.status) {
					return response.data.response;
				} else {
					throw new Error('Failed to get a valid response from the API.');
				}
			} catch (error) {
				if (error.response && error.response.status === 502) {
					throw new Error('Server error. Please try again later.');
				}
				throw error;
			}
		};

		try {
			const reply = await fetchResponse(prompt);
			if (reply.length > 2000) {
				for (let i = 0; i < reply.length; i += 2000) {
					await interaction.followUp(reply.substring(i, i + 2000));
				}
			} else {
				await interaction.followUp(reply);
			}
		} catch (error) {
			console.error(error);
			await interaction.followUp(`Error: ${error.message}`);
		}
	},
};
