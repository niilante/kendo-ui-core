#!/usr/bin/ruby

require 'erb'
require 'less'
require 'color'
require 'color/rgb/contrast'

def read(filename)
    File.readlines(filename).map { |line| line.gsub(/\r?\n/, '') }
end

def lines(content)
    content.split(/\r?\n/)
end

def parse(lines)
    var_dec = /@(.*):\s*(.*);/
    vars = {}
    lines.map { |line| var_dec.match(line) }.compact
        .each { |var| vars[var[1]] = var[2] }

    matches = true

    while matches
        matches = false
        vars.each { |var, value|
            match = /^@(.*)$/.match(value)

            if match and vars[match[1]] =~ /\S+/ then
                matches = true
                vars[var] = vars[match[1]]
            end
        }
    end

    vars
end

COLOR_MAPS = {}

def function_map(colors)
    args = colors.each_with_index.map { |c,i| "--modify-var='color#{i+1}=#{c}'" }
    key = colors.hash

    unless COLOR_MAPS[key] then
        functions = `/usr/bin/lessc #{args.join(' ')} generate-functions.less | grep 'process'`

        vals = {}
        functions.scan(/process:\s+([^=]+)\s*=\s*\[\s*([^\]]+)\s*\]/) {
            |func, colors| vals[func] = colors.split(' ')
        }

        COLOR_MAPS[key] = vals
    end

    COLOR_MAPS[key]
end

def name_from(lower)
    lower.capitalize.sub(/opal|contrast|black/) { |str| str.capitalize }
end

def same_values?(array)
    array.uniq.length == 1
end

type = "default"
dir = File.dirname(__FILE__)
template_content = File.read(File.join(dir, "variable-origins-#{type}.erb"))
template = ERB.new(template_content, 0, '%<>')

files = ARGV.each { |f| Dir.glob(f) }.flatten.sort

####
# extract values from skins

OLD_VARS = {}
BASE_VARS = {}

files.each do |current|
    current_lines = read(current)

    basename = current.sub(/\.less/,'')

    values = OLD_VARS[current] = parse(current_lines)

    themeName = name_from(/kendo\.(.*).less/.match(current)[1])

    new_base_content = template.result(binding)

    File.open("#{basename}.new.less", "w") do |f|
      f.write new_base_content
    end

    BASE_VARS[current] = parse(lines(new_base_content))
end

####
# define new colors based on extracted ones

BASE_VAR_NAMES = BASE_VARS.values.first.keys

OLD_VAR_NAMES = OLD_VARS.values.first.keys

THEMES = BASE_VARS.keys
theme_dir = File.dirname(files.first)
theme_template = File.read(File.join(theme_dir, "theme-template.less"))

rewritten = OLD_VAR_NAMES.select { |x| !(BASE_VAR_NAMES.include? x) }

BASE_ARRAYS = {}

def transform_color color
    color.gsub!(/([a-fA-F]|[0-9])/, '\1\1') if color.length == 4

    color
end

def exact_match old_values
    BASE_ARRAYS.key old_values
end

DIFF = {}

def color_diff a, b
    key = [a,b]
    unless DIFF[key] then
        begin
            a = Color::RGB.from_html(a)
            b = Color::RGB.from_html(b)

            DIFF[key] = a.contrast(b)
        rescue
            DIFF[key] = 1.0
        end
    end

    DIFF[key]
end

def similarity a, b
    a.each_with_index.map { |x,i| color_diff x, b[i] } .reduce(:+)
end

def all_colors array
    array.index { |v| v =~ /^#([a-fA-F]|[0-9])+$/ }
end

def transform old_values
    return unless all_colors old_values

    # find function that transforms a variable from BASE_ARRAYS to old_values
    best_fits = BASE_ARRAYS.map do |variable, values|
        next unless values.join(' ') =~ /^(#([a-fA-F]|[0-9])+\s*)+$/

        functions = function_map values

        functions
            .map { |function, colors| [function, similarity(colors, old_values), variable] }
            .min { |a, b| a[1] <=> b[1] }
    end

    function, delta, variable = best_fits.compact.min { |a, b| a[1] <=> b[1] }

    return function.gsub(/VARIABLE/, variable) if delta < 2

    "UNKNOWN: #{old_values.join(' ')}"
end

THEMES.each do |theme|
    BASE_VARS[theme].each do |variable, value|
        BASE_ARRAYS[variable] = [] unless BASE_ARRAYS[variable]

        BASE_ARRAYS[variable].push(transform_color value)
    end
end

def determine_actions(variables)
    actions = {}

    variables.each do |variable|
        old_values = []

        THEMES.each do |theme|
            old_values.push OLD_VARS[theme][variable]
        end

        old_values.map!(&method(:transform_color)) if all_colors old_values

        # determine action for variables
        if same_values? old_values
            actions[variable] = old_values[0]
        elsif exact_match old_values
            actions[variable] = "@#{exact_match old_values}"
        elsif all_colors old_values
            actions[variable] = transform old_values
        else
            actions[variable] = old_values[0]
        end
    end

    actions
end

def apply_actions variables, actions
    variables.map do |variable|
        value = actions[variable]

        "@#{variable}: #{value};"
    end
    .join("\n")
end

####
# write new type

type_content = apply_actions(rewritten, determine_actions(rewritten)) + "\n" + theme_template

File.open(File.join(theme_dir, "type-#{type}.less"), "w") do |f|
  f.write type_content.gsub(/\r?\n/, "\n")
end
