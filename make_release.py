import git
import os
import shutil

src_dir = 'src'
releases_dir = 'releases'

repo = git.Repo('.')
# branches = ['master']
# branches = ['master', 'mv2']


# for branch in branches:
    # repo.git.checkout(branch)
last_tag = repo.git.tag('--merged').split()[-1]
repo.git.checkout(last_tag)
shutil.make_archive(os.path.join(releases_dir, last_tag), 'zip', src_dir)
    
    # repo.git.add(all=True)
    # repo.git.commit('-m', 'add release ' + str(last_tag))

# repo.git.checkout(branches[0])