import re
import csv

def isWord(w: str) -> bool:
	"""
	Checks if a word is considered valid for the purposes of Chatman
	"""

	if len(w) * 2 > 500:
		return False

	character_count = 0
	for character in w:
		if re.match(r"[A-Za-z\-]", character):
			character_count += 1
	if character_count // len(w) * 100 < 50:
		return False

	return True


def main():
	filename = input("Input File: ")
	output_file = input("Output File: ")
	final_words = []
	with open(filename, "r") as csv_file:
		reader = csv.reader(csv_file)
		for row in reader:
			if len(row) == 0:
				continue
			word = row[0].strip()
			if isWord(word):
				final_words.append(word)
		# for line in f.readlines():
		# 	word = line.strip().strip("\"")
	with open(output_file, "w+") as output:
		output.write("\n".join(final_words))


if __name__ == "__main__":
	main()