require 'rubygems'
require 'sinatra/base'

class App < Sinatra::Base
	
	enable :raise_errors, :logging
	enable :show_exceptions if development?

	set :root,   File.expand_path('../', __FILE__)
	set :views,  File.expand_path('../views', __FILE__)
	set :public_folder, File.expand_path('../public', __FILE__)

	get '/' do
		erb :index, :locals => {
			:title => "10K"
		}
	end
end
